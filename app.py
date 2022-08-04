from flask import Flask, render_template, request, jsonify, make_response
import json
import ssl

import static.IoT as IoT
import static.Recognizer as Recognizer



# create Flask instance as 'app'
app = Flask(__name__)
iot = IoT.IoT()

# 최초 접속 URL 처리 함수
@app.route('/')
def home_page():
    '''
    최초 접속 URL 처리 함수
    '''
    # 220718 추가 : 블루투스 모듈 busy 문제 해결하기 위해
    # 최초 웹 페이지 접속 때 아두이노 상태를 받아오는 방식으로 수정
    #iot = IoT.IoT()
    #print(iot.current_iot_state)

    return render_template('home.html')

# 브라우저에서 음성 인식 후 접속하는 URL 처리 함수
@app.route('/speech_recog', methods=['POST'])
def control_iot():
    '''
    브라우저에서 음성 인식 후 접속하는 URL 처리 함수

    Recognizer 클래스에서 유효한 명령어인 지 확인

    IoT 클래스에 명령어를 전달해 IoT 기기 제어

    그 결과를 json 형태로 브라우저에 응답
    '''

    # save json result in dictionary type
    speech_recog_result = request.get_json()
    
    # get actual string value from dictionary
    # use only first element in result list
    user_said = speech_recog_result['speech_recog_result'][0]
    #print(f'raw cammand : {user_said}')
    
    # create recognizer instance
    recognizer = Recognizer.Recognizer(threshold=0.6)
    
    command = recognizer.what_user_said(user_said)
    
    if command != 'no match':
        # send command to IoT class
        # and control each IoT
        iot.command = command
        iot.socket.close()
        control_result = iot.control_iot()
        print(control_result)
        
        response = app.response_class(
            response = json.dumps(control_result),
            status = 200,
            mimetype = 'appliation/json'
        )
        
    print('-'*30)
    return response
    
# 홈페이지를 render한 다음 최초 실행 당시의 IoT on/off 여부를 확인해 브라우저에 응답해 주는 함수
# @app.route('/initial_setting', methods=['GET'])
# def response_initial_iot_status():
#     '''
#     홈페이지를 render한 다음 최초 실행 당시의 IoT on/off 여부를 확인해 브라우저에 응답해 주는 함수

#     IoT 클래스로 아두이노와 통신한 후 결과를 json 형태로 브라우저에 응답
#     '''
#     resp_dict = iot.current_iot_state

#     response = app.response_class(
#         response = json.dumps(resp_dict),
#         status = 200,
#         mimetype = 'appliation/json'
#     )

#     print(resp_dict)
#     return response
    
# 임시로 만든 함수
# iot 상태 업데이트
@app.route('/update_iot', methods=['GET'])
def update_iot_status():
    # IoT 기기 종류
    iots = ['light', 'boiler', 'fan']

    resp_dict = {'light': 'off', 'boiler': 'off', 'fan': 'off'}

    #iot = IoT.IoT()
    #result = iot.current_iot_state
    result = iot.get_initial_state()
    #print("update: ", result)

    response = app.response_class(
        response = json.dumps(result),
        status = 200,
        mimetype = 'appliation/json'
    )

    return response

# 메인 함수
# Flask app 객체 실행
if __name__ == '__main__':
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS)
    ssl_context.load_cert_chain(certfile='ssl/server.crt', keyfile='ssl/server.key', password='3680')
    
    app.run(debug=True, host='0.0.0.0', port=3680, ssl_context=ssl_context)