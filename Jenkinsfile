/**
 * Send notifications based on build status string
 */
def notifySlack(String buildStatus = 'STARTED') {
  // build status of null means successful
  buildStatus = buildStatus ?: 'SUCCESS'

  // Default values
  def colorName = 'RED'
  def colorCode = '#FF0000'
  def subject = "${buildStatus}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'"
  def summary = "${subject} (${env.BUILD_URL})"
  def details = """<p>${buildStatus}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
    <p>Check console output at &QUOT;<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>&QUOT;</p>"""

  // Override default values based on build status
  if (buildStatus == 'STARTED') {
    color = 'YELLOW'
    colorCode = '#FFFF00'
  } else if (buildStatus == 'SUCCESS') {
    color = 'GREEN'
    colorCode = '#00FF00'
  } else {
    color = 'RED'
    colorCode = '#FF0000'
  }

  // Send notifications
  slackSend (color: colorCode, message: summary)
  
}

def notifyBitbucket(String state) {

    if('SUCCESS' == state || 'FAILED' == state) {
        currentBuild.result = state         // Set result of currentBuild !Important!
    }
    
    notifyBitbucket commitSha1: '',
                considerUnstableAsSuccess: false, 
                credentialsId: 'micah-downing-user-pass', 
                disableInprogressNotification: false, 
                ignoreUnverifiedSSLPeer: true, 
                includeBuildNumberInKey: false, 
                prependParentProjectKey: false, 
                projectKey: '', 
                stashServerBaseUrl: 'https://bitbucket.di2e.net'
}

pipeline {
    agent none
    triggers {
        pollSCM ('0 0 1 1 0')
    }
    stages {
        stage('checkout') {
            steps {
                node('tfplenum-test-controller') {
                    script {
                        cleanWs()
                        
                        def GIT_COMMIT = sh(
                            script: "cat /opt/tfplenum/GIT_COMMIT_HASH",
                            returnStdout: true,
                        )
                        
                        dir('tfplenum') {
                            sh('cp -rf /opt/tfplenum/* .')
                            sh('cp -rf /opt/tfplenum/.git* .')
                            checkout changelog: false, poll: false, scm: [$class: 'GitSCM', branches: [[name: GIT_COMMIT]], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'micah-downing-user-pass', url: 'https://bitbucket.di2e.net/scm/thisiscvah/tfplenum.git']]]
                        }
                        notifySlack('STARTED')
                        notifyBitbucket('INPROGRESS')
                    }
                }
            }
        }
        stage('clone other repos') {
            steps {
                build 'get-repos-pipeline'
            }
        }
        stage('build / deploy system') {
            steps {
                node('master') { 
                    sh('sudo /usr/bin/python36 /opt/tfplenum-integration-testing/testy-tester/main.py /root/VMs.yml')
                }
            }
        }
        stage('system function testing') {
            steps {
                node('tfplenum-test-controller') { 
                    script {
                        env.JUNIT_OUTPUT_DIR = "$WORKSPACE/reports"
                        sh("mkdir -p $WORKSPACE/reports")
                    }
                    dir('/opt/tfplenum-integration-testing/playbooks') {
                        sh('make')
                    }
                }
            }
        }
    }
    post {
        always{
            node('tfplenum-test-controller'){
                junit 'reports/*.xml'
            }
            node('master') {                
                script {
                    currentBuild.result = currentBuild.result ?: 'SUCCESS'                    
                    notifySlack(currentBuild.result)
                    notifyBitbucket(currentBuild.result)                    
                }
            }
        }
    }
}