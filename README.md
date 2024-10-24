# 手机+智能插座：不间断电源Linux服务器解决方案

淘汰的手机cpu性能和存储容量太适合做一个linux服务器了。网上有太多的资料介绍了，这里就不再花费篇幅介绍了。但是如何24小时不间断工作就成了另外一个问题。如果一直插着充电器，一个浪费电，另外对电池寿命也有影响。本项目介绍一个手机+智能插座的解决方案。



## 硬件：

​			手机一部，智能插座一个（推荐涂鸦OEM生产的MC010 和MC010-W两种型号，其他的也类似）

## 软件：

​			termux ，autojs，智能插座对应的空值APP：和家亲（现在叫移动爱家）、智能生活（涂鸦的APP）

## 实施步骤：

分两种情况：一种简单的，不需要对智能插座进行刷机操作，但需要配置autojs脚本和对应手机app；

另外一种是需要对插座进行刷机操作，就不再需要安装autojs和对应的手机app了

### 方案1：

1. 手机安装对应智能插座app（推荐涂鸦的只能生活），对智能插座进行添加配置：为配置autojs的脚本，添加的设备名称改为“手机”

2. 手机的termux内安装 termux-api ,crontab

3. ```
   pkg install termux-api
   pkg install cronie
   #启用crond服务
   sv-enable crond
   ```

4. 在crontab添加定时任务

5. ```
   #每分钟将电池状态写入log文件
   * * * * * /data/data/com.termux/files/usr/bin/termux-battery-status > /data/data/com.termux/files/tmp/battery-status
   ```

6. 手机安装autojs，添加并执行项目内的“定时检测电量autojs脚本.js”脚本即可

### 方案2：

#### 1. termux内安装crond和mosquitto

​		**安装crond 、mosquitto、termux-api**

```
pkg install cronie
pkg install mosquitto
pkg install termux-api
#启用crond服务
sv-enable crond
#启动mosquitto服务
sv-enable mosquitto
```

​		**在crontab添加定时任务：并将项目内的脚本添加到/data/data/com.termux/files/www/tools/目录**

```
#每5分钟执行定时脚本
*/5 * * * * /data/data/com.termux/files/www/tools/switch_control.sh > /data/data/com.termux/files/tmp/switch_control.log
```

​		**mosquitto 配置 /data/data/com.termux/files/usr/etc/mosquitto/mosquitto.conf：**

​		**修改mosquitto配置文件，添加如下配置参数**

```
#配置监听端口
port 1883
#配置用户密码文件
password_file /data/data/com.termux/files/usr/etc/mosquitto/pwfile.txt
```

​		**添加mosquitto用户密码：用户名密码都为“esphome”**

```
mosquitto_passwd -c /data/data/com.termux/files/usr/etc/mosquitto/pwfile.txt esphome
```

​		**修改mosquitto服务的启动文件  /data/data/com.termux/files/usr/var/service/mosquitto/run 的内容如下**

```
exec mosquitto -c /data/data/com.termux/files/usr/etc/mosquitto/mosquitto.conf 2>&1
```

​		**重启mosquitto**

```
sv restart mosquitto
```



#### 2. 智能插座刷机：

##### 简单的方案：

​		MC010的刷机教程（[中国移动和家亲MC010智能插座刷tasmota接入HA](https://www.smyz.net/pc/21267.html)）

​		crond定时任务的脚本换成项目内的**switch_control_httpapi.sh**

##### 需要ESPHOME（单独安装）编译固件的方案：MC010-W刷机教程（[惠桔和家亲X1S智能插座免拆烧录esphome指南来啦！](https://bbs.hassbian.com/thread-25311-1-1.html)）

esphome的固件编译用的yaml配置文件如下：

```
esphome:
  name: switch-plus
  friendly_name: switch_plus

bk72xx:
  board: generic-bk7231n-qfn32-tuya

# Enable logging
logger:

# Enable Home Assistant API
api:
  encryption:
    key: "zNQ2eBjhRkqNaTYLTEFzjXwJMexeSv7hOQyzK+huKSE="

ota:
  - platform: esphome
    password: "014240114ead8033e91e05b3d80ff62a"

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

  # Enable fallback hotspot (captive portal) in case wifi connection fails
  ap:
    ssid: "Switch-Plus"
    password: "12341234"

captive_portal:

status_led:
  pin:
    number: P11
    inverted: True

output:
  - platform: gpio
    id: led1
    pin:
      number: P8
      inverted: True

switch:
  - platform: gpio
    pin: P26
    name: "Relay"
    id: relay
    restore_mode: RESTORE_DEFAULT_OFF
    on_turn_on:
      - output.turn_on: led1
    on_turn_off:
      - output.turn_off: led1

binary_sensor:
- platform: gpio
  pin: 
    number: P10
    mode: INPUT_PULLUP
    inverted: true
  name: "Switch"
  filters:
    - delayed_on_off: 100ms
  on_press:
    then:
      - switch.toggle: relay

mqtt:
  broker: !secret broker_ip
  username: !secret mqtt_username
  password: !secret mqtt_password
  client_id: esphome_000001
  on_message: 
    - topic: esphome/turn_on
      then: 
        - logger.log: "mqtt:turn_on"
        - switch.turn_on: relay
    - topic: esphome/turn_off
      then: 
        - logger.log: "mqtt:turn_off"
        - switch.turn_off: relay
```

