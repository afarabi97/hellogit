
# Nipper

start_nipper() {
	set_mac $1
	mac=$(get_mac)
	tar -C ~assessor -xf /cvah/tools/titania/nipperstudio/licenses/nipperstudio-$(echo $mac | tr -d :).tgz
	nipperstudio &
}

stop_nipper() {
	pkill -f nipperstudio
	ret_mac
}

status_nipper() {
	echo "Nipper is $(check_proc nipperstudio)."
}
