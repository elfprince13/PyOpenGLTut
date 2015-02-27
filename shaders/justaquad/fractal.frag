#version 330 core
uniform vec2 iResolution;
uniform float iGlobalTime;
uniform sampler1D iChannel0;

layout(location = 0) out vec4 fragColor;

void main() {
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
	vec2 z, c;
//*
	int maxIterations = 256;
	c = uv;
	z = c;
	
	int i;
	for(i=0; i<maxIterations; i++) {
		vec2 nZ = vec2(pow(z.x, 2.0) - pow(z.y, 2.0), (z.y * z.x + z.x * z.y)) + c;
		
		if(length(nZ) > 2.0){
			break;
		} else {
			z = nZ;
		}
	}
	fragColor = ((i == maxIterations) ? vec4(0.0, 0.0, 0.0, 1.0) : texture(iChannel0, float(i) / float(maxIterations)));
//*/
/*
	float scale = 8 * (1 - pow(sin(iGlobalTime*2.0/7.0),3.0))*(1 - pow(cos(iGlobalTime*3.0/11.0),3.0));
	vec2 center = vec2(0.7*cos(iGlobalTime/13.0) + 0.5, 0.7*sin(iGlobalTime/17.0));
	
	int maxIterations = int(min(ceil(256.0 * scale),2048.0));
	
	
	c = vec2((iResolution.x / iResolution.y) * (uv.x - 0.5), (uv.y - 0.5)) / scale - center;
	z = c;
	
	int i;
	for(i=0; i<maxIterations; i++) {
		vec2 nZ = vec2(pow(z.x, 2.0) - pow(z.y, 2.0), (z.y * z.x + z.x * z.y)) + c;
		
		if(length(nZ) > 2.0){
			break;
		} else {
			z = nZ;
		}
	}
	fragColor = ((i == maxIterations) ? vec4(0.0, 0.0, 0.0, 1.0) : texture(iChannel0, pow(float(i) / float(maxIterations),0.5)));
//*/
}