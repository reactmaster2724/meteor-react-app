#!/bin/bash

# Reload integrationtest.openb.net

PRODUCTION_KEY=""
PRIVATE_KEY="/Users/hanselke/Deployments/bitnami-hosting.pem"
IP_ADDRESS=""


RESTORE_ERPDATA=""
RESTORE_NEXTACTION=""


backup_erpnext() {
  echo "Killing & Reloading "

  ssh -o "StrictHostKeyChecking no" -i $PRIVATE_KEY root@erp.openb.net /bin/bash -c "'
  su frappe
  cd /home/frappe
  bench drop-site integrationtest.openb.net --db-password JIx70RDvoPFjoOd2
  bench new-site integrationtest.openb.net --mariadb-root-password JIx70RDvoPFjoOd2 --admin-password demo --source_sql /home/frappe/integrationtest.openb.net.sql
  '"
}



backup_erpnext