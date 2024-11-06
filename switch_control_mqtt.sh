mqtt_broker_ip='127.0.0.1'

status=`termux-battery-status`

#percentage=`echo $status | sed -n '3p'`
percent=`echo "$status" | sed -n '3p' | awk -F ':' '{print $2}'`
percent=`echo ${percent%?}`

charge=`echo "$status" | sed -n '5p' | awk -F ':' '{print $2}'`

echo $percent
echo $charge

if [ $((percent)) -eq 100 -a $charge = '"CHARGING",' ]
then
	mosquitto_pub -h mqtt_broker_ip -u esphome -P esphome -t esphome/turn_off -m 'will turn off'
	echo 'will turn off'
fi

if [ $((percent)) -eq 100 -a $charge = '"FULL",' ]
then
	mosquitto_pub -h mqtt_broker_ip -u esphome -P esphome -t esphome/turn_off -m 'will turn off'
	echo 'will turn off'
fi

if [ $((percent)) -lt 11 -a $charge = '"DISCHARGING",' ]
then
	mosquitto_pub -h mqtt_broker_ip -u esphome -P esphome -t esphome/turn_on -m 'will trun on'
	echo 'will turn on'
fi
