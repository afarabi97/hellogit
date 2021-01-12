# Nessus.

start_nessus() {
	set_mac $1
	sudo systemctl start nessusd.service
	wait_port 8834
	firefox "https://localhost:8834" &
}

stop_nessus() {
	sudo systemctl stop nessusd.service
	ret_mac
}

status_nessus() {
	echo "Nessus is $(check_port 8834)."
	echo "Nessus is $(check_proc nessusd)."
}


