#!/bin/bash

#
## Initial variables
PROJECT_ROOT_PATH=$(cd $(dirname $BASH_SOURCE); pwd)

CUSTOMER_ID=""
HOST_NAME=""
ROOT_URL=""
MONGO_URL=""


PRODUCTION_HOST_NAME=""
PRODUCTION_ROOT_URL=""
PRODUCTION_MONGO_URL=""

TEST_HOST_NAME=""
TEST_HOST_NAME=""
TEST_MONGO_URL=""

PRIVATE_KEY=""
IP_ADDRESS=""
AWS_ACCESS_KEY="AKIAJSCML3VTEAVLR5RA"
AWS_SECRET_KEY="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"

SPAWN_SERVERS=false
TEST_SETUP=false
BACKUP_PRODUCTION=false
PRODUCTION_SETUP=false
ERPNEXT_INITIAL_SETUP=false
MONGODB_INITIAL_SETUP=false
SERVER_DESTROY=false
NEXTACTION_SETUP=false
NEXTACTION_BRANCH=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')

TEST_NEXTACTION=false
PRODUCTION_NEXTACTION=false

RESTORE_TEST_ERPDATA=""
RESTORE_TEST_NEXTACTION=""
RESTORE_TEST_SERVER=false

RESTORE_PRODUCTION_ERPDATA=""
RESTORE_PRODUCTION_NEXTACTION=""
RESTORE_PRODUCTION_SERVER=false

RESTORE_ERPDATA=""
RESTORE_NEXTACTION=""
#
## Reset in case getopts has been used previously in the shell
#
OPTIND=1

while getopts "c:i:r:R:SptBDnN" opt; do
  case "$opt" in
    c )
      CUSTOMER_ID="$OPTARG"
      
      HOST_NAME="$OPTARG"'.openb.net'
      TEST_HOST_NAME="$OPTARG"'.openb.net'
      TEST_ROOT_URL='http://'"$OPTARG"'.openb.net/'
      TEST_MONGO_URL='mongodb://'"$OPTARG"'.openb.net:27017/nextaction'

      
      PRODUCTION_HOST_NAME="$OPTARG"'.nextaction.co'
      PRODUCTION_ROOT_URL='http://'"$OPTARG"'.nextaction.co/'
      PRODUCTION_MONGO_URL='mongodb://'"$OPTARG"'.nextaction.co:27017/nextaction'
      ;;

    i )
      PRIVATE_KEY="$OPTARG"
      ;;
    r )
      RESTORE_TEST_ERPDATA="$CUSTOMER_ID"'-erpdata-'"$OPTARG"'.tar.xz'
      RESTORE_TEST_NEXTACTION="$CUSTOMER_ID"'-nextaction-'"$OPTARG"'.tar.xz'
      RESTORE_TEST_SERVER=true
      ;;
    R )
      RESTORE_PRODUCTION_ERPDATA="$CUSTOMER_ID"'-erpdata-'"$OPTARG"'.tar.xz'
      RESTORE_PRODUCTION_NEXTACTION="$CUSTOMER_ID"'-nextaction-'"$OPTARG"'.tar.xz'
      RESTORE_PRODUCTION_SERVER=true
      ;;
      
      
    S )
      SPAWN_SERVERS=true
      ;;
      
    p )
      PRODUCTION_SETUP=true
      ;;
    t )
      TEST_SETUP=true
      ;;
    B )
      BACKUP_PRODUCTION=true
      ;;
      
    D )
      SERVER_DESTROY=true
      ;;
      
    N )
      PRODUCTION_NEXTACTION=true
      ;;
    n )
      TEST_NEXTACTION=true
      ;;
  esac
done


spawn_servers() {
  echo "Spawning new server: $HOST_NAME"
  tugboat create $HOST_NAME
  tugboat wait $HOST_NAME
  sleep 10
}

production_setup() {

  IP_ADDRESS="`tugboat info -n "$HOST_NAME" --attribute ip --porcelain`"
  echo "Server's IP Address: $IP_ADDRESS"
  ssh -o "StrictHostKeyChecking no" -i $PRIVATE_KEY root@$IP_ADDRESS /bin/bash -c "'
    docker rm -f route53 route53erp nginx-proxy &> /dev/null
    docker run --rm --name route53 -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY" -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_KEY" -e AWS_CONNECTION_REGION="ap-southeast-1" -e HOST_NAME="$HOST_NAME" -e IP_ADDRESS="$IP_ADDRESS" -e ROUTE53_UPDATE_FREQUENCY=300 hanselke/route53:v1.7.1 '/opt/route53/r53dyndns.py' -I "$IP_ADDRESS" -R "$HOST_NAME"
    docker run --rm --name route53erp -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY" -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_KEY" -e AWS_CONNECTION_REGION="ap-southeast-1" -e HOST_NAME='erp.'"$HOST_NAME" -e IP_ADDRESS="$IP_ADDRESS" -e ROUTE53_UPDATE_FREQUENCY=300 hanselke/route53:v1.7.1 '/opt/route53/r53dyndns.py' -I "$IP_ADDRESS"  -R 'erp.'"$HOST_NAME"
    docker run --name nginx-proxy -d -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro jwilder/nginx-proxy
    '"

  
}
test_setup() {
  IP_ADDRESS="`tugboat info -n "$HOST_NAME" --attribute ip --porcelain`"
  echo "Server's IP Address: $IP_ADDRESS"
  ssh -o "StrictHostKeyChecking no" -i $PRIVATE_KEY root@$IP_ADDRESS /bin/bash -c "'
    docker rm -f route53 route53erp nginx-proxy &> /dev/null
    docker run --rm --name route53 -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY" -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_KEY" -e AWS_CONNECTION_REGION="ap-southeast-1" -e HOST_NAME="$HOST_NAME" -e IP_ADDRESS="$IP_ADDRESS" -e ROUTE53_UPDATE_FREQUENCY=300 hanselke/route53:v1.7.1 '/opt/route53/r53dyndns.py' -I "$IP_ADDRESS" -R "$HOST_NAME"
    docker run --rm --name route53erp -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY" -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_KEY" -e AWS_CONNECTION_REGION="ap-southeast-1" -e HOST_NAME='erp.'"$HOST_NAME" -e IP_ADDRESS="$IP_ADDRESS" -e ROUTE53_UPDATE_FREQUENCY=300 hanselke/route53:v1.7.1 '/opt/route53/r53dyndns.py' -I "$IP_ADDRESS"  -R 'erp.'"$HOST_NAME"
    docker run --name nginx-proxy -d -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro jwilder/nginx-proxy
    '"

  
}

erpnext_initial_setup() {
  echo "Setting up ERP system"
  IP_ADDRESS="`tugboat info -n "$HOST_NAME" --attribute ip --porcelain`"
  ssh -o "StrictHostKeyChecking no" -i $PRIVATE_KEY root@$IP_ADDRESS /bin/bash -c "'
    docker rm -f erpdata erpnext &> /dev/null
    docker create -v /home/frappe/frappe-bench/sites/site1.local/ -v /var/lib/mysql --name erpdata davidgu/erpnext
    docker run -d -p 3500:80 --name erpnext -e VIRTUAL_HOST='erp.'"$HOST_NAME" -e VIRTUAL_PORT="3500" --volumes-from erpdata davidgu/erpnext
  '"
}

mongodb_initial_setup() {
  echo "Setting up MongoDB"
  IP_ADDRESS="`tugboat info -n "$HOST_NAME" --attribute ip --porcelain`"
  ssh -o "StrictHostKeyChecking no" -i $PRIVATE_KEY root@$IP_ADDRESS /bin/bash -c "'
    rm -rf /opt/mongo_data &> /dev/null
    mkdir /opt/mongo_data &> /dev/null
    docker rm -f mongo &> /dev/null
    docker run -d -p 27017:27017 --name mongo -v /opt/mongo_data:/data/db mongo
  '"
}

nextaction_setup() {
  echo "Setting up NextAction"
  IP_ADDRESS="`tugboat info -n "$HOST_NAME" --attribute ip --porcelain`"
  echo $IP_ADDRESS
  echo $ROOT_URL
  meteor build --architecture=os.linux.x86_64 /tmp
  scp -o "StrictHostKeyChecking no" -i $PRIVATE_KEY /tmp/"$NEXTACTION_BRANCH".tar.gz root@$IP_ADDRESS:/opt
  ssh -o "StrictHostKeyChecking no" -i $PRIVATE_KEY root@$IP_ADDRESS /bin/bash -c "'
    docker rm -f nextaction &> /dev/null
    docker run --name nextaction -d -e VIRTUAL_HOST="$HOST_NAME" -e VIRTUAL_PORT="4000" -e ROOT_URL='http://'"$HOST_NAME" -e MONGO_URL='mongodb://'"$HOST_NAME"':27017/nextaction' -v /opt:/bundle -p 4000:80 meteorhacks/meteord:base
  '"
}

server_destroy() {
  echo "Destroying server"
  IP_ADDRESS="`tugboat info -n "$HOST_NAME" --attribute ip --porcelain`"
  ssh -o "StrictHostKeyChecking no" -i $PRIVATE_KEY root@$IP_ADDRESS /bin/bash -c "'
    docker rm -f nextaction &> /dev/null
    rm -rf /opt/mongodb &> /dev/null
    docker rm -f route53 route53erp nginx-proxy
    docker run -d --name route53 -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY" -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_KEY" -e AWS_CONNECTION_REGION="ap-southeast-1" -e HOST_NAME="$HOST_NAME" -e IP_ADDRESS="$IP_ADDRESS" -e ROUTE53_UPDATE_FREQUENCY=600 hanselke/route53:v1.7.1 '/opt/route53/r53dyndns.py' -I "8.8.8.8"  -R "$HOST_NAME"
    docker run -d --name route53erp -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY" -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_KEY" -e AWS_CONNECTION_REGION="ap-southeast-1" -e HOST_NAME='erp.'"$HOST_NAME" -e IP_ADDRESS="$IP_ADDRESS" -e ROUTE53_UPDATE_FREQUENCY=600 hanselke/route53:v1.7.1 '/opt/route53/r53dyndns.py' -I "8.8.8.8" -R 'erp.'"$HOST_NAME"
  '"
 sleep 10
 tugboat destroy $HOST_NAME
}


backup_production() {
  echo "Backing up $PRODUCTION_HOST_NAME into $TEST_HOST_NAME"
  HOST_NAME=$PRODUCTION_HOST_NAME
  ROOT_URL=$PRODUCTION_ROOT_URL
  MONGO_URL=$PRODUCTION_MONGO_URL
  IP_ADDRESS="`tugboat info -n "$HOST_NAME" --attribute ip --porcelain`"
  ssh -o "StrictHostKeyChecking no" -i $PRIVATE_KEY root@$IP_ADDRESS /bin/bash -c "'
  docker pull boombatower/docker-backup-s3
  ###backup ERP from production

docker run --rm \
 --volumes-from erpdata \
 -e ACCESS_KEY="AKIAJSCML3VTEAVLR5RA" \
 -e SECRET_KEY="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" \
 -e BUCKET="s3://openb-erpdata/" \
 -v $(pwd):/backup \
 boombatower/docker-backup-s3 backup "$CUSTOMER_ID"'-erpdata-'"$(date +%d%b%y).tar.xz"
 echo "$CLIENT_ID ERP backed up"
  
    ###backup NA from production
docker run --rm \
 --volumes-from mongo \
 -e ACCESS_KEY="AKIAJSCML3VTEAVLR5RA" \
 -e SECRET_KEY="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" \
 -e BUCKET="s3://openb-erpdata/" \
 -v $(pwd):/backup \
 boombatower/docker-backup-s3 backup "$CUSTOMER_ID"'-nextaction-'"$(date +%d%b%y).tar.xz"
 echo "$CLIENT_ID NextAction backed up"
 
 '"
  

  HOST_NAME=$TEST_HOST_NAME
  ROOT_URL=$TEST_ROOT_URL
  MONGO_URL=$TEST_MONGO_URL
  IP_ADDRESS="`tugboat info -n "$HOST_NAME" --attribute ip --porcelain`"
  ssh -o "StrictHostKeyChecking no" -i $PRIVATE_KEY root@$IP_ADDRESS /bin/bash -c "'
  docker pull boombatower/docker-backup-s3
  
### kill and load from backup ERP in test
docker rm -f erpdata erpnext &> /dev/null
docker create -v /home/frappe/frappe-bench/sites/site1.local/ -v /var/lib/mysql --name erpdata davidgu/erpnext
docker run --rm \
 --volumes-from erpdata \
 -e ACCESS_KEY="AKIAJSCML3VTEAVLR5RA" \
 -e SECRET_KEY="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" \
 -e BUCKET="s3://openb-erpdata/" \
 boombatower/docker-backup-s3 restore "$CUSTOMER_ID"'-erpdata-'"$(date +%d%b%y).tar.xz"

docker run -d -p 3500:80 --name erpnext -e VIRTUAL_HOST='erp.'"$HOST_NAME" -e VIRTUAL_PORT="3500" --volumes-from erpdata davidgu/erpnext


### kill and load from backup Nextaction
docker rm -f mongo nextaction &> /dev/null
docker run -d -p 27017:27017 --name mongo -v /opt/mongo_data:/data/db mongo

docker run --rm \
 --volumes-from mongo \
 -e ACCESS_KEY="AKIAJSCML3VTEAVLR5RA" \
 -e SECRET_KEY="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" \
 -e BUCKET="s3://openb-erpdata/" \
 -e TAR_OPTS="--verbose" \
 boombatower/docker-backup-s3 restore "$CUSTOMER_ID"'-nextaction-'"$(date +%d%b%y).tar.xz"
 
docker run --name nextaction -d -e VIRTUAL_HOST="$HOST_NAME" -e VIRTUAL_PORT="4000" -e ROOT_URL='http://'"$HOST_NAME" -e MONGO_URL='mongodb://'"$HOST_NAME"':27017/nextaction' -v /opt:/bundle -p 4000:80 meteorhacks/meteord:base


 echo "$TEST_HOST_NAME loaded with $PRODUCTION_HOST_NAME"
  '"
}

restore_server() {
  echo "Restore ERP: $RESTORE_ERPDATA"
  echo "Restore NextAction: $RESTORE_NEXTACTION"
  echo "Restoring into $HOST_NAME"
  


### kill and load from backup ERP in test

  IP_ADDRESS="`tugboat info -n "$HOST_NAME" --attribute ip --porcelain`"
  ssh -o "StrictHostKeyChecking no" -i $PRIVATE_KEY root@$IP_ADDRESS /bin/bash -c "'
  docker pull boombatower/docker-backup-s3
  

docker rm -f erpdata erpnext &> /dev/null
docker create -v /home/frappe/frappe-bench/sites/site1.local/ -v /var/lib/mysql --name erpdata davidgu/erpnext
docker run --rm \
 --volumes-from erpdata \
 -e ACCESS_KEY="AKIAJSCML3VTEAVLR5RA" \
 -e SECRET_KEY="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" \
 -e BUCKET="s3://openb-erpdata/" \
 boombatower/docker-backup-s3 restore "$RESTORE_ERPDATA"

docker run -d -p 3500:80 --name erpnext -e VIRTUAL_HOST='erp.'"$HOST_NAME" -e VIRTUAL_PORT="3500" --volumes-from erpdata davidgu/erpnext


### kill and load from backup Nextaction
docker rm -f mongo nextaction &> /dev/null
docker run -d -p 27017:27017 --name mongo -v /opt/mongo_data:/data/db mongo

docker run --rm \
 --volumes-from mongo \
 -e ACCESS_KEY="AKIAJSCML3VTEAVLR5RA" \
 -e SECRET_KEY="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" \
 -e BUCKET="s3://openb-erpdata/" \
 boombatower/docker-backup-s3 restore "$RESTORE_NEXTACTION"
 
docker run --name nextaction -d -e VIRTUAL_HOST="$HOST_NAME" -e VIRTUAL_PORT="4000" -e ROOT_URL='http://'"$HOST_NAME" -e MONGO_URL='mongodb://'"$HOST_NAME"':27017/nextaction' -v /opt:/bundle -p 4000:80 meteorhacks/meteord:base


 echo "$HOST_NAME loaded with $RESTORE_ERPDATA and $RESTORE_NEXTACTION"
  '"
}

if [[ "$SERVER_DESTROY" = true ]]; then
  server_destroy
fi

if [[ "$PRODUCTION_SETUP" = true ]]; then
  HOST_NAME=$PRODUCTION_HOST_NAME
  ROOT_URL=$PRODUCTION_ROOT_URL
  MONGO_URL=$PRODUCTION_MONGO_URL


  if [[ "$SPAWN_SERVERS" = true ]]; then
    spawn_servers
  fi

  production_setup
  erpnext_initial_setup
  mongodb_initial_setup
  nextaction_setup
fi

if [[ "$TEST_SETUP" = true ]]; then
  HOST_NAME=$TEST_HOST_NAME
  ROOT_URL=$TEST_ROOT_URL
  MONGO_URL=$TEST_MONGO_URL
    
  if [[ "$SPAWN_SERVERS" = true ]]; then
    spawn_servers
  fi
  test_setup
  erpnext_initial_setup
  mongodb_initial_setup
  nextaction_setup
fi


if [[ "$BACKUP_PRODUCTION" = true ]]; then
  backup_production
fi

if [[ "$PRODUCTION_NEXTACTION" = true ]]; then
  HOST_NAME=$PRODUCTION_HOST_NAME
  ROOT_URL=$PRODUCTION_ROOT_URL
  MONGO_URL=$PRODUCTION_MONGO_URL

  nextaction_setup
fi

if [[ "$TEST_NEXTACTION" = true ]]; then
  HOST_NAME=$TEST_HOST_NAME
  ROOT_URL=$TEST_ROOT_URL
  MONGO_URL=$TEST_MONGO_URL
  nextaction_setup
fi

if [[ "$RESTORE_TEST_SERVER" = true ]]; then
  HOST_NAME=$TEST_HOST_NAME
  ROOT_URL=$TEST_ROOT_URL
  MONGO_URL=$TEST_MONGO_URL
  RESTORE_ERPDATA=$RESTORE_TEST_ERPDATA
  RESTORE_NEXTACTION=$RESTORE_TEST_NEXTACTION
  restore_server
fi

if [[ "$RESTORE_PRODUCTION_SERVER" = true ]]; then
  HOST_NAME=$PRODUCTION_HOST_NAME
  ROOT_URL=$PRODUCTION_ROOT_URL
  MONGO_URL=$PRODUCTION_MONGO_URL
  RESTORE_ERPDATA=$RESTORE_PRODUCTION_ERPDATA
  RESTORE_NEXTACTION=$RESTORE_PRODUCTION_NEXTACTION
  restore_server
fi