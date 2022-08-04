// IoT 종류
IoTs = ['light', 'boiler', 'fan'];

var startAnnyang = document.getElementById('annyang-start');
var pauseAnnyang = document.getElementById('annyang-pause');
var result = document.getElementsByClassName('result')[0];

// 220717 추가 : IoT 제어 중에는 업데이트가 안되도록 하는 변수 (임시, 나중에 개선할 수 있으면 개선할 것)
var isUpdateAble = false;
    
// 시간을 표시하는 함수
// HH:MM:SS
// X요일
// YYYY년 MM월 DD일
function displayClock() {
    var clock = document.getElementById("time");
    var todayDay = document.getElementById("day");
    var todayDate = document.getElementById("date");

    // 요일 배열
    var dayInString = ['일', '월', '화', '수', '목', '금', '토'];

    // 현재 시간을 불러온다`
    var currentDate = new Date();

    // 연도 정보를 저장
    var year = currentDate.getFullYear();
    // 달 정보를 저장 (getMonth() 함수는 0~11을 반환하므로 끝에 1을 더해준다)
    var month = currentDate.getMonth() + 1;
    // 일 정보를 저장
    var date = currentDate.getDate();
    // 요일 정보를 저장 ()
    var day = currentDate.getDay();
    // 시 정보를 저장
    var hour = currentDate.getHours();
    // 분 정보 저장
    var min = currentDate.getMinutes();
    // 초 정보 저장
    var sec = currentDate.getSeconds();

    clock.innerHTML = `${hour<10 ? `0${hour}`:hour}:${min<10 ? `0${min}`:min}:${sec<10 ? `0${sec}`:sec}`;
    todayDay.innerHTML = `${dayInString[day]}요일`;
    todayDate.innerHTML = `${year}년 ${month}월 ${date}일`;
}

// setInterval() 함수로 1초마다 시간을 갱신
function init() {
    setInterval(displayClock, 1000);
}

// (임시) annyang 시작 버튼 이벤트 리스너
startAnnyang.addEventListener('click', function() {
    if (annyang) {
    
        //annyang.addCommands(commands);
        //annyang.debug();
        annyang.setLanguage('ko');
        annyang.start();
        console.log('annyang started');
    }
});

// (임시) annyang 중지 버튼 이벤트 리스너
pauseAnnyang.addEventListener('click', function() {
    annyang.pause();
    console.log('annyang stopped');
});

// 음성 인식 결과 처리 콜백
annyang.addCallback('result', function(userSaid) {
    result.innerHTML = userSaid[0];
    isUpdateAble = false;

    // 3초동안 화면에 음성 인식 결과 표시
    setTimeout(function() {
        result.innerHTML = ''
    }, 3000);
	
	// make json and send it to server
    const json_dict = {'speech_recog_result': userSaid};
    const stringify = JSON.stringify(json_dict);
	
	// 음성 인식 결과를 서버로 전송
    $.ajax({
        url: '/speech_recog',
        type: 'POST',
        contentType: 'application/json',
        //data: JSON.stringify(stringify),
		data: stringify,
        success: function(json_data) {
            console.log(json_data);
			changeIotUi(json_data);
            isUpdateAble = true;
        }
    });
});

// 최초 웹 페이지 접속 시 IoT on/off 여부를 json 형식으로 받아오는 함수
function setInitialIotStatus() {
    $.ajax({
        type: 'GET',
        url: '/initial_setting',
        contentType: 'application/json'
    }).done(function(json_data) {
        changeIotUi(json_data);
		console.log(json_data);
        isUpdateAble = true;
    }).fail(function(xhr, status, error) {
        console.log('error');
        isUpdateAble = true;
    });
}

// 웹 페이지 IoT UI 바꿔주는 함수
function changeIotUi(json_data) {
    for (var key in json_data) {
        if (IoTs.includes(key)) {
            var ui = document.getElementById(key);
            
            if (json_data[key].includes('on')) {
                ui.style.color = '#ffffff';
            }
            else {
                ui.style.color = '#000000';
            }
        }
    }
}

// 220717 추가 : n초마다 IoT 상태 업데이트 받아오는 거로 변경
function update() {
    setInterval(function() {
        if (isUpdateAble) {
            $.ajax({
                type: 'GET',
                url: '/update_iot',
                contentType: 'application/json'
            }).done(function(json_data) {
                changeIotUi(json_data);
                console.log(json_data);
            }).fail(function(xhr, status, error) {
                console.log('error');
            });
        }
        else {
            console.log('cannot update now');
        }
    }, 2000);
}

// 시간 표시 시작
init();

// 최초 접속 시 IoT 상태 UI 갱신
//setInitialIotStatus();
isUpdateAble = true;
update();