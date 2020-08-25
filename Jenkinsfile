pipeline {
    agent any
    environment {
        CONTAINER_NAME= "`grep -A1 services docker-compose-ci.yml | tail -1 | sed -e s'/ //'g -e s'/://'g`"
        TAG = "`grep image docker-compose-ci.yml | cut -d':' -f3`"
        APP_ISSUER=credentials('APP_ISSUER')
        APP_PRIVATE_KEY=credentials('API_PRIVATE_KEY_SELF_SOVEREING')
        REACT_APP_EBSI_ENV='integration'
        EBSI_ENV='integration'
    }
    stages {
        stage('Clone repo') {
            steps {
               checkout scm;
            }
        }
        stage('Unit Test') {
            steps{
                sh "yarn install --frozen-lockfile"
                sh "yarn test:unit"
            }
        }
        stage('Pre Checks') {
            steps {
                sh "/usr/local/bin/auto_container_validate.sh ${CONTAINER_NAME}"
            }
        }
        stage('Build image') {
            steps {
                sh "if [[ -f .env.integration ]]; then { cp .env.integration .env; }; fi"
                sh "/usr/local/bin/docker-compose -f docker-compose-ci.yml build"
            }
        }
        stage('Push to ECR') {
            steps {
                 sh '`/usr/local/bin/aws ecr get-login --no-include-email --region eu-central-1`'
                 sh "/usr/local/bin/docker-compose -f docker-compose-ci.yml push"
             }
        }
        stage('Modify YAML & Commit') {
            steps {
                 sh "sudo su - ebsi1-robot -c 'cd /etc/puppetlabs/code/environments/integration ; git pull'"
                 sh "sudo -u ebsi1-robot /usr/local/bin/ebsi_add_update_service_version_tag.rb integration int/lux/app.yaml ${CONTAINER_NAME} ${TAG}"
                 sh "sudo su - ebsi1-robot -c 'cd /etc/puppetlabs/code/environments/integration ; git add .; git commit -am auto; git push'"
             }
        }
        stage("Deploy on Integration") {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ebsi1-robot', keyFileVariable: 'PK')]) {
                       sh "ssh -i $PK ebsi1-operator@mco01-0-ebsi-dev-lux.ebsi.xyz -o StrictHostKeyChecking=no -o 'UserKnownHostsFile /dev/null' -p 48722 '/usr/local/bin/puppet_run_containers_only.sh int app lux'"
                       sh "ssh -i $PK ebsi1-operator@mco01-0-ebsi-dev-lux.ebsi.xyz -o StrictHostKeyChecking=no -o 'UserKnownHostsFile /dev/null' -p 48722 /usr/local/bin/verify_container_version.sh int app lux ${CONTAINER_NAME} ${TAG}"
                    }
                }
        }
    }
}
