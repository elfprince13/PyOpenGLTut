#version 330 core
uniform vec2 iResolution;
uniform float iGlobalTime;
uniform sampler1D iChannel0;

layout(location = 0) out vec4 fragColor;

void main() {
	vec2 z, c;
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
	
	float scale = 8 * (1 - pow(sin(iGlobalTime*2.0/7.0),3.0))*(1 - pow(cos(iGlobalTime*3.0/11.0),3.0));
	vec2 center = vec2(cos(iGlobalTime/13.0), sin(iGlobalTime/17.0));
	
	int iter = int(min(ceil(256.0 * scale),2048.0));
	
	
	c.x =  (iResolution.x / iResolution.y) * (uv.x - 0.5) / scale - center.x;
	c.y = (uv.y - 0.5) / scale - center.y;
	
	int i;
	z = c;
	for(i=0; i<iter; i++) {
		float x = (z.x * z.x - z.y * z.y) + c.x;
		float y = (z.y * z.x + z.x * z.y) + c.y;
		
		if((x * x + y * y) > 4.0) break;
		z.x = x;
		z.y = y;
	}
	
	fragColor = ((i == iter) ? vec4(0.0, 0.0, 0.0, 1.0) : texture(iChannel0, pow(float(i) / float(iter),0.5)));
}