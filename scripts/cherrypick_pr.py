#!/usr/bin/env python3
"""Cherry pick and backport a PR"""
from __future__ import print_function

from builtins import input
import sys
import os
import argparse
from os.path import expanduser
import re
from subprocess import check_call, call, check_output
import requests

usage = """
Example usage:

./scripts/cherrypick_pr.py --create_pr 5.0 2565 6490604aa0cf7fa61932a90700e6ca988fc8a527

In case of backporting errors, fix them, then run:

git cherry-pick --continue
./scripts/cherrypick_pr.py --create_pr 5.0 2565 6490604aa0cf7fa61932a90700e6ca988fc8a527 --continue

This script does the following:

* cleanups both from_branch and to_branch (warning: drops local changes)
* creates a temporary branch named something like "branch_2565"
* calls the git cherry-pick command in this branch
* after fixing the merge errors (if needed), pushes the branch to your
  remote
* if the --create_pr flag is used, it uses the GitHub API to create the PR
  for you. Note that this requires you to have a Github token with the
  public_repo scope in the `~/.cvah/gitlab.token` file. This token
  should be also authorized to Elastic organization so as to work with single-sign-on.
  (see https://help.github.com/en/articles/authorizing-a-personal-access-token-for-use-with-saml-single-sign-on)

Note that you need to take the commit hashes from `git log` on the
from_branch, copying the IDs from Github doesn't work in case we squashed the
PR.
"""


def main():
    """Main"""
    parser = argparse.ArgumentParser(
        description="Creates a PR for cherry-picking commits",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=usage)
    parser.add_argument("to_branch",
                        help="To branch (e.g release/3.5.0.0)")
    parser.add_argument("pr_number",
                        help="The PR number being merged (e.g. 2345)")
    parser.add_argument("commit_hashes", metavar="hash", nargs="+",
                        help="The commit hashes to cherry pick." +
                        " You can specify multiple.")
    parser.add_argument("--yes", action="store_true",
                        help="Assume yes. Warning: discards local changes.")
    parser.add_argument("--continue", action="store_true",
                        help="Continue after fixing merging errors.")
    parser.add_argument("--from_branch", default="devel",
                        help="From branch")
    parser.add_argument("--create_pr", action="store_true",
                        help="Create a PR using the Gitlab API " +
                        "(requires token in ~/.cvah/gitlab.token)")
    parser.add_argument("--diff", action="store_true",
                        help="Display the diff before pushing the PR")
    parser.add_argument("--remote", default="origin",
                        help="Which remote to push the backport branch to. Defaults to 'origin'")
    args = parser.parse_args()

    print(args)

    tmp_branch = "backport_{}_{}".format(args.pr_number, args.to_branch)

    if not vars(args)["continue"]:
        if not args.yes and input("This will destroy all local changes. " +
                                      "Continue? [y/n]: ") != "y":
            return 1
        check_call("git reset --hard", shell=True)
        check_call("git clean -df", shell=True)
        check_call("git fetch", shell=True)

        check_call("git checkout {}".format(args.from_branch), shell=True)
        check_call("git pull", shell=True)

        check_call("git checkout {}".format(args.to_branch), shell=True)
        check_call("git pull", shell=True)

        call("git branch -D {} > /dev/null".format(tmp_branch), shell=True)
        check_call("git checkout -b {}".format(tmp_branch), shell=True)
        if call("git cherry-pick -x {}".format(" ".join(args.commit_hashes)),
                shell=True) != 0:
            print("Looks like you have cherry-pick errors.")
            print("Fix them, then run: ")
            print("    git cherry-pick --continue")
            print("    {} --continue".format(" ".join(sys.argv)))
            return 1

    if len(check_output("git status -s", shell=True).strip()) > 0:
        print("Looks like you have uncommitted changes." +
              " Please execute first: git cherry-pick --continue")
        return 1

    if len(check_output("git log HEAD...{}".format(args.to_branch),
                        shell=True).strip()) == 0:
        print("No commit to push")
        return 1

    if args.diff:
        call("git diff {}".format(args.to_branch), shell=True)
        if input("Continue? [y/n]: ") != "y":
            print("Aborting cherry-pick.")
            return 1

    print("Ready to push branch.")

    remote = args.remote

    call("git push {} :{} > /dev/null".format(remote, tmp_branch),
         shell=True)
    check_call("git push --set-upstream {} {}"
               .format(remote, tmp_branch), shell=True)
    if not args.create_pr:
        print("Done. Open PR by following this URL: \n\t" +
              "https://gitlab.sil.lab/tfplenum/tfplenum/-/compare/{}...{}"
              .format(args.to_branch, tmp_branch))
    else:
        token = open(expanduser("~/.cvah/gitlab.token"), "r").read().strip()
        base = "https://gitlab.sil.lab/api/v4/projects/1"
        session = requests.Session()
        session.verify = False
        session.headers.update({"PRIVATE-TOKEN": token})

        original_pr = session.get(base + "/merge_requests/" + args.pr_number).json()

        # set labels
        labels = ["backport"]
        for label in original_pr.get('labels', []):
            if not label.startswith("backport"):
                labels.append(label)
        # create PR
        request = session.post(base + "/merge_requests", json=dict(
            title="Cherry-pick !{} to {}: {}".format(args.pr_number, args.to_branch, original_pr["title"]),
            source_branch=tmp_branch,
            target_branch=args.to_branch,
            description="Cherry-pick of PR !{} to {} branch. Original message: \n\n{}"
            .format(args.pr_number, args.to_branch, original_pr["description"]),
            remove_source_branch=True,
            allow_collaboration=True,
            squash=True,
            labels = ",".join(labels)
        ))
        if request.status_code > 299:
            print("Creating PR failed: {}".format(request.json()))
            sys.exit(1)
        new_pr = request.json()

        # remove needs backport label from the original PR
        branch_version_pattern = re.compile(r'release\/(?P<version>([0-9]+\.?)+)')
        match = branch_version_pattern.match(args.to_branch)
        if match:
            session.put(base + "/merge_requests/{}".format(args.pr_number), json={"remove_labels": "backport::needed", "add_labels": "backport::v{}".format(match.group('version'))})

        print("\nDone. PR created: {}".format(new_pr["web_url"]))
        print("Please go and check it and add the review tags")

if __name__ == "__main__":
    sys.exit(main())
