# Nexpose

start_nexpose() {
	sudo systemctl start nexpose.service
	gnome-terminal --window --command "sudo journalctl -lf -u nexpose.service" &
	wait_port 3780
	firefox "https://localhost:3780" 1>/dev/null 2>&1 &
}

stop_nexpose() {
	sudo systemctl stop nexpose.service
	sudo pkill -f "journactl -lf -u nexpose.service"
	ret_mac
}

status_nexpose() {
	echo "Nexpose is $(check_port 3780)."
	echo "Nexpose is $(check_proc nsc.sh)."
}

