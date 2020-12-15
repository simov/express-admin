pipeline {
	agent any

	parameters {
		booleanParam(name: 'Deploy', defaultValue: false, description: 'Deploy to Server Prod?')
	}

	stages{
		stage('clone repo') {
			steps {
				sshPublisher(
		            publishers: [
		              	sshPublisherDesc(
		                	configName: "serverDev",
		                	verbose: false,
		                	transfers: [
		                  		sshTransfer(
		                    		execCommand: "/home/safrudin/appliction/./clone.sh",
		                    		execTimeout: 120000
		                  		)
		                	]
		              	)
		            ]
		        )
			}
		}

		stage('build & run') {
			steps {
				sshPublisher(
		            publishers: [
		              	sshPublisherDesc(
		                	configName: "serverDev",
		                	verbose: false,
		                	transfers: [
		                  		sshTransfer(
		                    		execCommand: "/home/safrudin/appliction/./run.sh",
		                    		execTimeout: 120000
		                  		)
		                	]
		              	)
		            ]
		        )
			}
		}

		stage('Deploy to Prod') {
			when {
				expression {
					params.Deploy
				}
			}

			steps {
				sshPublisher(
		            publishers: [
		              	sshPublisherDesc(
		                	configName: "serverProd",
		                	verbose: false,
		                	transfers: [
		                  		sshTransfer(
		                    		execCommand: "/home/safrudin/appliction/./run.sh",
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