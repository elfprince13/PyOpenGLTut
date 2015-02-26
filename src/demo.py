#!/usr/bin/env python 

import os
import OpenGL
from OpenGL.GL import *

import cyglfw3 as glfw

import numpy
import time
import math
import os.path

RESOLUTION = [640, 480]

def compileshader(src, kind):
	shader = glCreateShader(kind)
	glShaderSource(shader, src)
	glCompileShader(shader)
	result = glGetShaderiv(shader, GL_COMPILE_STATUS)
	if not(result):
		infoLen = glGetShaderiv(shader, GL_INFO_LOG_LENGTH)
		infoLog = glGetShaderInfoLog(shader)
		print "Couldn't compile shader of kind %d with source:\n%s\n" % (kind, src)
		print "Received the following length-%d log message:\n\t%s" % (infoLen, infoLog)
		glDeleteShader(shader)
		shader = 0
	else:
		return shader
def setupquaddemo(fragFile):
	vert_shader = 0
	with open(os.path.abspath("./shaders/justaquad/supersimple.vert"),'r') as vertH:
		shader_src = vertH.read()
		vert_shader = compileshader(shader_src, GL_VERTEX_SHADER)
	
	frag_shader = 0
	with open(os.path.abspath("./shaders/justaquad/%s" % fragFile),'r') as vertH:
		shader_src = vertH.read()
		frag_shader = compileshader(shader_src, GL_FRAGMENT_SHADER)
		
	if (not vert_shader) or (not frag_shader):		
		if glIsShader(vert_shader): glDeleteShader(vert_shader)
		if glIsShader(frag_shader): glDeleteShader(frag_shader)
		print "Shader creation failed"
		exit()

	else:
		program = glCreateProgram()
		
		if not program:
			print 'glCreateProgram failed!'
			exit()
		else:
			# attach shaders
			glAttachShader(program, vert_shader)
			glAttachShader(program, frag_shader)
			# Link the program
			glLinkProgram(program)
			# Check the link status
			linked = glGetProgramiv(program, GL_LINK_STATUS)
			if not linked:
				infoLen = glGetProgramiv(program, GL_INFO_LOG_LENGTH)
				infoLog = glGetProgramInfoLog(program);
				glDeleteProgram(program)
				print "Couldn't link program"
				print "Received the following length-%d log message:\n\t%s" % (infoLen, infoLog)
				exit()
			else:
				iResolutionUniform = glGetUniformLocation(program, 'iResolution')
				iGlobalTimeUniform = glGetUniformLocation(program, 'iGlobalTime')
				
				quadVerts = [
					0, 0, 
					1, 0,
					1, 1,
					0, 1,
				]
				quadIndices = [
					0,1,2,
					2,3,0
				]
				
				vaoID = glGenVertexArrays(1)
				glBindVertexArray(vaoID)
				
				vboID = glGenBuffers(1)
				glBindBuffer(GL_ARRAY_BUFFER, vboID)
				vertexData = numpy.array(quadVerts, numpy.float32)
				glBufferData(GL_ARRAY_BUFFER,  4*len(vertexData), vertexData, GL_STATIC_DRAW)
				glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 0, None)
				glEnableVertexAttribArray(0)
				
				glBindBuffer(GL_ARRAY_BUFFER, 0)
				
				iboID = glGenBuffers(1)
				glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, iboID)
				indexData = numpy.array(quadIndices, numpy.byte)
				glBufferData(GL_ELEMENT_ARRAY_BUFFER, len(indexData), indexData, GL_STATIC_DRAW)
				
				glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0)
				glBindVertexArray(0)
				
				def preRender(time, resolution):
					glUseProgram(program)
					glUniform1f(iGlobalTimeUniform,float(time))
					glUniform2f(iResolutionUniform,float(resolution[0]),float(resolution[1]))
					
					glBindVertexArray(vaoID)
					glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, iboID)
					
				
				def render():
					glDrawElements(GL_TRIANGLES, len(indexData), GL_UNSIGNED_BYTE, None)
					
				def postRender():
					glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0)
					glBindVertexArray(0)
				
				def cleanup():
					glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0)
					glBindVertexArray(0)
					glDeleteBuffers(1,numpy.array(vboID))
					glDeleteBuffers(1,numpy.array(iboID))
					glDeleteVertexArrays(1,numpy.array(vaoID))
					glDeleteProgram(program)
					glDeleteShader(vert_shader)
					glDeleteShader(frag_shader)
					
				preRender(0, RESOLUTION)
				glValidateProgram(program)
				validation = glGetProgramiv(program, GL_VALIDATE_STATUS)
				if not validation:
					infoLen = glGetProgramiv(program, GL_INFO_LOG_LENGTH)
					infoLog = glGetProgramInfoLog(program);
					postRender()
					cleanup()
					print "Couldn't validate program"
					print "Received the following length-%d log message:\n\t%s" % (infoLen, infoLog)
					exit()
				else:
					postRender()
					
				return (preRender, render, postRender, cleanup)

def renderloop(window, renderables):
	startTime = time.time()
	while not glfw.WindowShouldClose(window):
		resolution = glfw.GetFramebufferSize(window)
		# we want the display to run from (0 -> 1), not (-1, 1)
		glViewport(-resolution[0], -resolution[1], 2*resolution[0], 2*resolution[1])
		glClearColor(0, 0, 0, 1)
		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
		# Render here
		for (pre,render,post) in renderables:
			pre(time.time() - startTime,resolution)
			render()
			post()
	
		# Swap front and back buffers
		glfw.SwapBuffers(window)
		
		# Poll for and process events
		glfw.PollEvents()

def main():
	startdir = os.getcwd()
	if not glfw.Init():
		exit()
	else:
		#glfw is badle behaved with our working directory for some reason =(
		os.chdir(startdir)
		
	glfw.WindowHint(glfw.CONTEXT_VERSION_MAJOR, 3)
	glfw.WindowHint(glfw.CONTEXT_VERSION_MINOR, 3)
	glfw.WindowHint(glfw.OPENGL_FORWARD_COMPAT, GL_TRUE)
	glfw.WindowHint(glfw.OPENGL_PROFILE, glfw.OPENGL_CORE_PROFILE)
	window = glfw.CreateWindow(RESOLUTION[0], RESOLUTION[1], 'OpenGL Tut')
	if window:
		glfw.MakeContextCurrent(window)
		
		quadFuncs = setupquaddemo("shaunplasma.frag")
		quadRender,quadCleanup = quadFuncs[:3],quadFuncs[3]
		
		renderloop(window, [quadRender])
		quadCleanup()
		
	glfw.Terminate()

# call main
if __name__ == '__main__':
	main()