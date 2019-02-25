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

pipeline {
    agent none
        stages {
            stage('checkout'){
                steps {
                    node('master') {
                        script{
                            notifySlack('STARTED')
                        }
                      
                      checkout([$class: 'GitSCM', branches: [[name: '*/devel']], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], 
                        userRemoteConfigs: [[credentialsId: 'micah-downing-user-pass', url: 'https://bitbucket.di2e.net/scm/thisiscvah/tfplenum-integration-testing.git']]])
                      
                      checkout([$class: 'GitSCM', branches: [[name: '${tfplenum_deployer_commit_hash}']], doGenerateSubmoduleConfigurations: false,  
                        extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: 'tfplenum-deployer'], 
                        [$class: 'ChangelogToBranch', options: [compareRemote: 'origin', compareTarget: 'devel']]], submoduleCfg: [], 
                        userRemoteConfigs: [[credentialsId: 'micah-downing-user-pass', url: 'https://bitbucket.di2e.net/scm/thisiscvah/tfplenum-deployer.git']]])
                      
                      checkout([$class: 'GitSCM', branches: [[name: '${tfplenum_commit_hash}']], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: 'tfplenum'], 
                        [$class: 'ChangelogToBranch', options: [compareRemote: 'origin', compareTarget: 'devel']]], submoduleCfg: [], 
                        userRemoteConfigs: [[credentialsId: 'micah-downing-user-pass', url: 'https://bitbucket.di2e.net/scm/thisiscvah/tfplenum.git']]])
                    }
                }
            }
            stage('setup controller') {
                options {
                    timeout(time: 60, unit: 'MINUTES')
                }
                steps {
                      node('master') {
                        script {
                            withCredentials([usernamePassword(credentialsId: 'micah-downing-user-pass', passwordVariable: 'di2e_password', usernameVariable: 'di2e_username'), 
                                usernamePassword(credentialsId: '70424cfa-62e2-4bd6-80de-a1168ad02c91', passwordVariable: 'vcenter_password', usernameVariable: 'vcenter_username')]) {
                                def command = "sudo /opt/tfplenum-integration-testing/testy-tester/tfp-env/bin/python3.6 testy-tester/main.py --setup-controller \
                                --path testy-tester/testcases/${kit} -du ${di2e_username} -dp ${di2e_password} -vu ${vcenter_username} -vp ${vcenter_password} \
                                --tfplenum-deployer-commit-hash ${tfplenum_deployer_commit_hash} --tfplenum-commit-hash ${tfplenum_commit_hash}"
                                println command
                                sh(command)
                            }
                        }
                    }
                }
            }
            stage('kickstart vms') {
                options {
                    timeout(time: 45, unit: 'MINUTES')
                }
                steps {
                    node('master') {
                        script {
                            withCredentials([usernamePassword(credentialsId: 'micah-downing-user-pass', passwordVariable: 'di2e_password', usernameVariable: 'di2e_username'), 
                                usernamePassword(credentialsId: '70424cfa-62e2-4bd6-80de-a1168ad02c91', passwordVariable: 'vcenter_password', usernameVariable: 'vcenter_username')]) {
                                def command = "sudo /opt/tfplenum-integration-testing/testy-tester/tfp-env/bin/python3.6 testy-tester/main.py --run-kickstart --headless \
                                --path testy-tester/testcases/${kit} -du ${di2e_username} -dp ${di2e_password} -vu ${vcenter_username} -vp ${vcenter_password}"
                                println command
                                sh(command)
                            }
                        }
                    }
                }
            }
            stage('deploy kit') {
                options {
                    timeout(time: 60, unit: 'MINUTES')
                }
                steps {
                    node('master') {
                        script {
                            withCredentials([usernamePassword(credentialsId: 'micah-downing-user-pass', passwordVariable: 'di2e_password', usernameVariable: 'di2e_username'), 
                            usernamePassword(credentialsId: '70424cfa-62e2-4bd6-80de-a1168ad02c91', passwordVariable: 'vcenter_password', usernameVariable: 'vcenter_username')]) {
                                def command = "sudo /opt/tfplenum-integration-testing/testy-tester/tfp-env/bin/python3.6 testy-tester/main.py --run-kit --headless \
                                --path testy-tester/testcases/${kit} -du ${di2e_username} -dp ${di2e_password} -vu ${vcenter_username} -vp ${vcenter_password}"
                                println command
                                sh(command)
                            }
                        }
                    }
                }
            }
            stage('system function testing') {
                options {
                    timeout(time: 30, unit: 'MINUTES')
                }
                steps {
                    node('master') {
                        script {
                            withCredentials([usernamePassword(credentialsId: 'micah-downing-user-pass', passwordVariable: 'di2e_password', usernameVariable: 'di2e_username'), 
                                usernamePassword(credentialsId: '70424cfa-62e2-4bd6-80de-a1168ad02c91', passwordVariable: 'vcenter_password', usernameVariable: 'vcenter_username')]) {
                                sh("mkdir -p $WORKSPACE/reports")
                                def command = "sudo /opt/tfplenum-integration-testing/testy-tester/tfp-env/bin/python3.6 testy-tester/main.py --run-integration-tests \
                                --path testy-tester/testcases/${kit} -du ${di2e_username} -dp ${di2e_password} -vu ${vcenter_username} -vp ${vcenter_password}"
                                println command
                                sh(command)
                            }
                        }
                    }
                }
            }
            stage('simulate power failure') {
                options {
                    timeout(time: 30, unit: 'MINUTES')
                }
                steps {
                    node('master') {
                        script {
                            withCredentials([usernamePassword(credentialsId: 'micah-downing-user-pass', passwordVariable: 'di2e_password', usernameVariable: 'di2e_username'), 
                            usernamePassword(credentialsId: '70424cfa-62e2-4bd6-80de-a1168ad02c91', passwordVariable: 'vcenter_password', usernameVariable: 'vcenter_username')]) {
                                def command = "sudo /opt/tfplenum-integration-testing/testy-tester/tfp-env/bin/python3.6 testy-tester/main.py --simulate-powerfailure \
                                --path testy-tester/testcases/${kit} -du ${di2e_username} -dp ${di2e_password} -vu ${vcenter_username} -vp ${vcenter_password}"
                                println command
                                sh(command)
                            }
                        }
                    }
                }
            }
            stage('system function testing2') {
                options {
                    timeout(time: 30, unit: 'MINUTES')
                }
                steps {
                    node('master') {
                        script {
                            withCredentials([usernamePassword(credentialsId: 'micah-downing-user-pass', passwordVariable: 'di2e_password', usernameVariable: 'di2e_username'), 
                            usernamePassword(credentialsId: '70424cfa-62e2-4bd6-80de-a1168ad02c91', passwordVariable: 'vcenter_password', usernameVariable: 'vcenter_username')]) {
                                def command = "sudo /opt/tfplenum-integration-testing/testy-tester/tfp-env/bin/python3.6 testy-tester/main.py --run-integration-tests \
                                --path testy-tester/testcases/${kit} -du ${di2e_username} -dp ${di2e_password} -vu ${vcenter_username} -vp ${vcenter_password}"
                                println command
                                sh(command)
                            }
                        }
                    }
                }
            }
            stage('clean up test kits') {
                steps {
                    node('master') {
                        script {
                            currentBuild.result = currentBuild.result ?: 'SUCCESS'
                            if (currentBuild.result == 'SUCCESS' && params.cleanup_kit) {
                                withCredentials([usernamePassword(credentialsId: 'micah-downing-user-pass', passwordVariable: 'di2e_password', usernameVariable: 'di2e_username'), 
                                usernamePassword(credentialsId: '70424cfa-62e2-4bd6-80de-a1168ad02c91', passwordVariable: 'vcenter_password', usernameVariable: 'vcenter_username')]) {
                                    def command = "sudo /opt/tfplenum-integration-testing/testy-tester/tfp-env/bin/python3.6 testy-tester/main.py --cleanup \
                                    --path testy-tester/testcases/${kit} -du ${di2e_username} -dp ${di2e_password} -vu ${vcenter_username} -vp ${vcenter_password}"
                                    println command
                                    sh(command)
                                }
                            }
                        }
                    }
                }
            }
        }
    post {
        always{
            node('master'){
                script {
                    currentBuild.result = currentBuild.result ?: 'SUCCESS'
                    notifySlack(currentBuild.result)
                }
                junit 'reports/*.xml'
                cleanWs()
            }
        }
    }
}
