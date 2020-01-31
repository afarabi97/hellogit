import getpass
import pickle

def get_password(pass_type: str) -> str:
    while True:
        di2e_password = getpass.getpass(prompt="Type your {} password: ".format(pass_type))
        di2e_repassword = getpass.getpass(prompt="Retype your {} password: ".format(pass_type))
        if di2e_password == di2e_repassword:
            return di2e_password

def main():
    creds = {}
    di2e_username = input("Type your DI2E username: ")
    di2e_password = get_password("DI2E")

    vcenter_username = input("Type your vcenter username: ")
    vcenter_password = get_password("vcenter")

    esxi_username = input("Type ESXI username: ")
    esxi_password = get_password("esxi")

    creds = {'di2e_username': di2e_username,
             'di2e_password': di2e_password,
             'vcenter_username': vcenter_username,
             'vcenter_password': vcenter_password,
             'esxi_username': esxi_username,
             'esxi_password': esxi_password}

    with open("creds.pickle", "wb") as outfile:
        pickle.dump(creds, outfile)

    with open("creds.pickle", 'rb') as infile:
        print(pickle.load(infile))


if __name__ == "__main__":
    main()
