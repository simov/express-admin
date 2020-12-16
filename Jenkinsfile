pipeline {
	agent any

	stages{
		stage('clone repo') {
			when {
				expression {
					env.GIT_BRANCH == 'master' || env.GIT_BRANCH == 'develop'
				}
			}

			steps {

				script {
					if (env.GIT_BRANCH == 'master') {
						server = "serverProd"
					} else if (env.GIT_BRANCH == 'develop') {
						server = "serverDev"
					}

					sshPublisher(
			            publishers: [
			              	sshPublisherDesc(
			                	configName: "${server}",
			                	verbose: false,
			                	transfers: [
			                  		sshTransfer(
			                    		execCommand: "/home/safrudin/application/./clone.sh",
			                    		execTimeout: 120000
			                  		)
			                	]
			              	)
			            ]
			        )
				}
			}
		}

		stage('build & run') {
			when {
				expression {
					env.GIT_BRANCH == 'master' || env.GIT_BRANCH == 'develop'
				}
			}

			steps {

				script {
					if (env.GIT_BRANCH == 'master') {
						server = "serverProd"
					} else if (env.GIT_BRANCH == 'develop') {
						server = "serverDev"
					}

					sshPublisher(
			            publishers: [
			              	sshPublisherDesc(
			                	configName: "${server}",
			                	verbose: false,
			                	transfers: [
			                  		sshTransfer(
			                    		execCommand: "/home/safrudin/application/./run.sh",
			                    		execTimeout: 120000
			                  		)
			                	]
			              	)
			            ]
			        )
			    }
			}
		}

	}
}