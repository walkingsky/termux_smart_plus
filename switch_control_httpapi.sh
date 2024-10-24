status=`termux-battery-status`

#percentage=`echo $status | sed -n '3p'`
percent=`echo "$status" | sed -n '3p' | awk -F ':' '{print $2}'`
percent=`echo ${percent%?}`

charge=`echo "$status" | sed -n '5p' | awk -F ':' '{print $2}'`

echo $percent
echo $charge

if [ $((percent)) -eq 100 -a $charge = '"CHARGING",' ]
then
#ip改成智能插座的对应ip
	curl http://192.168.1.117/cm?cmnd=Power%20Off
	echo 'will turn off'
fi

if [ $((percent)) -eq 100 -a $charge = '"FULL",' ]
then
	curl http://192.168.1.117/cm?cmnd=Power%20Off
	echo 'will turn off'
fi

if [ $((percent)) -lt 11 -a $charge = '"DISCHARGING",' ]
then
	curl http://192.168.1.117/cm?cmnd=Power%20On
	echo 'will turn on'
fi