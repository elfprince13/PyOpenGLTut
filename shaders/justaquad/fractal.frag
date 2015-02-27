#version 330 core
uniform vec2 iResolution;
uniform float iGlobalTime;
uniform sampler1D iChannel0;

layout(location = 0) out vec4 fragColor;

void main() {
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
	vec2 z, c;
/*
	int maxIterations = 256;
	c = uv;
	z = c;
	
	int i;
	for(i=0; i<maxIterations; i++) {
		float nX = pow(z.x, 2.0) - pow(z.y, 2.0) + c.x;
		float nY = (z.y * z.x + z.x * z.y) + c.y;
		
		if((pow(nX,2.0) + pow(nY, 2.0)) > 4.0) break;
		z.x = nX;
		z.y = nY;
	}
	fragColor = ((i == maxIterations) ? vec4(0.0, 0.0, 0.0, 1.0) : texture(iChannel0, float(i) / float(maxIterations)));
//*/
//*
	float scale = 8 * (1 - pow(sin(iGlobalTime*2.0/7.0),3.0))*(1 - pow(cos(iGlobalTime*3.0/11.0),3.0));
	vec2 center = vec2(0.7*cos(iGlobalTime/13.0) + 0.5, 0.7*sin(iGlobalTime/17.0));
	
	int maxIterations = int(min(ceil(256.0 * scale),2048.0));
	
	
	c.x = (iResolution.x / iResolution.y) * (uv.x - 0.5) / scale - center.x;
	c.y = (uv.y - 0.5) / scale - center.y;
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