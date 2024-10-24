/**
 * 定时检测手机电池电量，电量不够时操作“合家亲（移动爱家）”、“智能生活”打开智能开关
 * author: walkingsky
 * url:https://github.com/walkingsky/autojs_credit
 */

auto.waitFor();

function wake_up_screen() {
    console.log('[wake_up_screen]');
    try {
        while (!device.isScreenOn()) {
            device.wakeUpIfNeeded();
            sleep(2000);
        }
    } catch (err) {
        toastLog('点亮屏幕发生错误：' + err.message);
    }
}

function kill_app(app_name) {
    //结束app，执行脚本要手机root
    console.log('[kill_app]');
    let result = shell('am force-stop ' + app_name, true);
    if (result.code == 0) {
        toastLog('成功结束应用');
    } else {
        toastLog('结束应用失败');
    }
}

function 和家亲App(turn_on) {
    console.log('[和家亲App]');
    try {
        let app_opened = false;
        while (!app_opened) {
            app.launch('com.cmri.universalapp');
            //text('全屋智能').id('tv_quanwu').waitFor();
            sleep(20000);
            wake_up_screen();
            //关闭广告
            if (id('tvCancel').className('android.widget.ImageView').indexInParent(1).exists()) {
                id('tvCancel').className('android.widget.ImageView').indexInParent(1).findOne(1000).click();
            }

            if (id('sm_device_name_tv').textContains('手机').exists()) {
                var btn = id('sm_device_name_tv').textContains('手机').findOne();
                btn.parent().click();
                id('image_socket_switch').className('android.widget.ImageView').waitFor();
                app_opened = true;

            } else if (id('image_socket_switch').className('android.widget.ImageView').exists()) {
                app_opened = true;
            } else {
                toastLog('打开应用不正确，没找到对应元素');
                kill_app('com.cmri.universalapp');
                sleep(3000);
                wake_up_screen();
            }
        }

    } catch (err) {
        toastLog('打开应用发生错误：' + err.message);
    }
    sleep(2000);
    wake_up_screen();
    let status = id('multiple_switch_status_tv').className('android.widget.TextView').findOne(5000);
    if (status) {
        if (turn_on) {
            if (status.text() == '已关闭') {
                status.parent().click();
                toastLog('打开')
            }
        } else {
            if (status.text() == '已打开') {
                status.parent().click();
                toastLog('关闭')
            }
        }
        sleep(5000);
        //结束应用
        kill_app('com.cmri.universalapp');;
    }
}

function 智能生活App(turn_on) {
    console.log('[智能生活App]');
    try {
        let app_opened = false;
        while (!app_opened) {
            app.launch('com.tuya.smartlifeiot');
            sleep(20000);
            wake_up_screen();
            //关闭广告
            if (id('tvCancel').className('android.widget.ImageView').indexInParent(1).exists()) {
                id('tvCancel').className('android.widget.ImageView').indexInParent(1).findOne(1000).click();
            }
            if (id('deviceName').textContains('手机').exists()) {
                var btn = id('deviceName').textContains('手机').findOne();
                btn.parent().parent().click();
                className('android.widget.TextView').textContains('设置').waitFor();
                //app_opened = true;

            } else if (className('android.widget.TextView').textContains('设置').exists()) {
                //app_opened = true;
            } else {
                toastLog('打开应用不正确，没找到对应元素');
                sleep(3000);
                kill_app('com.tuya.smartlifeiot');
                sleep(3000);
                wake_up_screen();
            }

            click(540, 985);

            sleep(3000);

            if (turn_on) {
                if (device.isCharging()) {
                    console.log('设备在充电');
                    app_opened = true;
                    toastLog('打开')
                }
            } else {
                if (!device.isCharging()) {
                    console.log('设备没有在充电');
                    app_opened = true;
                    toastLog('关闭')
                }
            }

        }

    } catch (err) {
        toastLog('打开应用发生错误：' + err.message);
    }
}

function checkout() {
    console.log('[checkout]');
    var battery = device.getBattery();
    var isCharging = device.isCharging();
    toastLog('电池电量：' + battery + '%，');
    toastLog(isCharging ? '正在充电' : '没有在充电');

    if (battery == 100 && isCharging) {
        //和家亲App(false);
        智能生活App(false);

    } else if (battery < 12 && !isCharging) {
        //和家亲App(true);
        智能生活App(true);
    }
}


console.log('[程序开始执行]');

//5分总定时触发（300000秒）
setInterval(function () {
    toastLog('开始新一轮执行');
    checkout();
}, 300000);




