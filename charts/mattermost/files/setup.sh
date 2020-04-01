#!/bin/sh

echo "Starting setup script"
#Wait for Mattermost to start
while :
do
  curl -XGET http://localhost:8065
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
ADMIN=$(curl -XPOST -H "Content-Type: application/json" --data $user_create http://localhost:8065/api/v4/users)


#Loging in as Admin
echo "Loging in as Admin"
user_login='{"device_id":"","login_id":"'${ADMIN_USER}'","password":"'${ADMIN_PASS}'","token":""}'
LOGIN=$(curl -XPOST -H "Content-Type: application/json" -D headers.txt --data $user_login http://localhost:8065/api/v4/users/login)
token=$(cat headers.txt | grep -Fi token | awk {'print $2'})

echo "Update Settings"
settings='{"ServiceSettings":{"SiteURL":"http://mattermost.lan"}}'
update_settings=$(curl -XPUT -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" --data $settings http://localhost:8065/api/v4http://your-mattermost-url.com/api/v4/config)

#Get my teams
echo "Checking teams"
teams=$(curl -XGET -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" http://localhost:8065/api/v4/users/me/teams)
if [[ $(echo $teams | jq '. | length') == 0 ]]; then
  echo "Creating default team"
  new_team='{"display_name":"'${TEAM_NAME}'","name":"'${team_id}'","type":"O"}'
  create_team=$(curl -XPOST -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" --data $new_team http://localhost:8065/api/v4/teams)
fi
