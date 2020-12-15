pipeline {
	agent any

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
	}
}