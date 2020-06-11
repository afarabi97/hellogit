#!/bin/sh

echo "Starting setup script"
#Wait for Mattermost to start
while :
do
  curl --insecure -XGET https://localhost:8065
  ret_val=$?
  if [[ $ret_val == 0 ]]; then
      echo "Mattermost is running"
      break
  fi
  sleep 10
done
#ADMIN_PASS="1qaz@WSX1qaz@WSX"
#ADMIN_USER="admin"
#TEAM_NAME='CPT'
team_id=$(echo ${TEAM_NAME// /_} | awk '{print tolower($0)}')
#Create Admin User
echo "Creating Admin user"
user_create='{"email":"'${ADMIN_EMAIL}'","username":"'${ADMIN_USER}'","password":"'${ADMIN_PASS}'","allow_marketing":false}'
ADMIN=$(curl --insecure -XPOST -H "Content-Type: application/json" --data $user_create https://localhost:8065/api/v4/users)


#Loging in as Admin
echo "Loging in as Admin"
user_login='{"device_id":"","login_id":"'${ADMIN_USER}'","password":"'${ADMIN_PASS}'","token":""}'
LOGIN=$(curl --insecure -XPOST -H "Content-Type: application/json" -D headers.txt --data $user_login https://localhost:8065/api/v4/users/login)
token=$(cat headers.txt | grep -Fi token | awk {'print $2'})

#Get my teams
echo "Checking teams"
teams=$(curl --insecure -XGET -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" https://localhost:8065/api/v4/users/me/teams)
if [[ $(echo $teams | jq '. | length') == 0 ]]; then
  echo "Creating default team"
  new_team='{"display_name":"'${TEAM_NAME}'","name":"'${team_id}'","type":"O"}'
  create_team=$(curl --insecure -XPOST -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" --data $new_team https://localhost:8065/api/v4/teams)
  team_guid=$(echo $create_team | jq '.id')
  echo "Updating team to Open Invite"
  update_team_data='{"id":"'${team_guid}'","display_name":"'${TEAM_NAME}'","allow_open_invite":true}'
  update_team=$(curl --insecure -XPUT -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" --data $update_team_data "https://localhost:8065/api/v4/teams/${team_guid}")
fi
