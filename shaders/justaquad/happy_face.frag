#version 330 core
uniform vec2 iResolution;
uniform float iGlobalTime;

layout(location = 0) out vec4 fragColor;

void main(void)
{
	vec2 center = vec2(0.5, 0.5);
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
	uv.x = (uv.x - 0.5) * (iResolution.x / iResolution.y) + 0.5;
	
	vec2 displ = uv-center;
	float dist = length(displ);
	
	vec4 bg = vec4(sin(dist),cos(dist),0.5+0.5*sin(iGlobalTime),1.0);
	
	float circle_influence = pow(1.0/(1.0+4.0*abs(dist - 0.33)),10.0);
	
	float mouth_influence;
	float mouth_fade;
	float mouth_height = 0.5;
	
	mouth_influence = pow(1.0/(1.0+4.0*abs(dist - 0.25)),14.0);
	
	if(uv.y > 0.5){
		mouth_fade = pow(1.0/(1.0+16.0*abs(mouth_height - uv.y)),14.0);
	} else {
		mouth_fade = 1.0;
	}
	mouth_influence = mouth_influence * mouth_fade;
	
	vec2 left_eye = vec2(0.5 - 0.125, 0.5 + 0.125);
	vec2 right_eye = vec2(0.5 + 0.125, 0.5 + 0.125);
	
	float left_eye_influence;
	float leDist = length(uv - left_eye);
	float eyeRad = 0.03;
	if(leDist < eyeRad) {
		left_eye_influence = 1.0;
	} else {
		left_eye_influence = pow(1.0/(1.0+4.0*(leDist - eyeRad)),14.0);
	}
	
	float right_eye_influence;
	vec2 reDispl = (uv - right_eye);
	float reDist = length(vec2(reDispl.x,reDispl.y / (1.0 - pow(sin(iGlobalTime),4.0))));
	if(reDist < eyeRad) {
		right_eye_influence = 1.0;
	} else {
		right_eye_influence = pow(1.0/(1.0+4.0*(reDist - eyeRad)),14.0);
	}
	
	vec4 circle = vec4(0.0,0.0,0.0,circle_influence);
	vec4 mouth = vec4(0.7,0.0,0.0,mouth_influence);
	vec4 leftEye = vec4(0.0,0.0,0.7,left_eye_influence);
	vec4 rightEye = vec4(0.0,0.0,0.7,right_eye_influence);
	fragColor = mix(mix(mix(mix(bg,circle,circle.a),mouth,mouth.a),leftEye,leftEye.a),rightEye,rightEye.a);
	
}