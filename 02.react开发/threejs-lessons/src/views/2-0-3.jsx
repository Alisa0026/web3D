import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

// 2-0-3 dat.gui 调试透视相机
const Page = () => {
  useEffect(() => {

    const $ = {
      cameraIndex: 0,
      createScene() { // 创建场景

        const canvas = document.getElementById('c');

        const width = window.innerWidth
        const height = window.innerHeight

        canvas.width = width
        canvas.height = height

        this.canvas = canvas
        this.width = width
        this.height = height
        // three.js
        /**
         * 1. 有锯齿
         * 2. 没有3D立体效果
         * 3. 6 个面能不能有不同颜色
         */

        // 创建3D场景对象
        const sence = new THREE.Scene()

        this.sence = sence
      },
      createLights() { // 创建光照
        // 2.2 添加全局光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        // 2.3 添加方向光照，这样效果就比较立体了
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)

        this.sence.add(ambientLight, directionalLight)
      },
      createObjects() {

        // 创建立方体的几何体
        const geometry = new THREE.BoxGeometry(1, 1, 1)

        // 创建立方体的基础材质
        // const material = new THREE.MeshBasicMaterial({
        //   color: 0x1890ff,
        // })

        // 2.1 更换对光照敏感的材质对象,要有光照才能看到
        const material = new THREE.MeshLambertMaterial({
          color: 0x1890ff,
          // 3.1 设置材质的透明度，可以看到一个平面是两个三角形面，所以有6个顶点
          // wireframe: true,
        })
        // 创建3D物体对象 网格对象
        const mesh = new THREE.Mesh(geometry, material)
        const mesh1 = new THREE.Mesh(geometry, material)
        mesh1.position.set(-10, 0, 0)

        this.sence.add(mesh, mesh1)

        this.mesh = mesh
      },
      createCamera() { // 创建相机
        const pCamera = new THREE.PerspectiveCamera(75, this.width / this.height, 1, 10)

        pCamera.position.set(0, 0, 3)
        // pCamera.up.set(0, -1, 0) // 设置相机朝向
        pCamera.lookAt(this.sence.position)
        this.sence.add(pCamera)
        this.pCamera = pCamera
        this.camera = pCamera


        // 创建第二个相机
        const watcherCamera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)

        watcherCamera.position.set(2, 2, 6)
        watcherCamera.lookAt(this.sence.position)
        this.watcherCamera = watcherCamera
        this.sence.add(watcherCamera)
        // this.camera = watcherCamera
      },
      datGui() {
        const _this = this
        const gui = new dat.GUI();
        const parmas = {
          wireframe: false,
          color: '#1890ff',
          switchCamera() {
            if (_this.cameraIndex === 0) {
              _this.camera = _this.watcherCamera
              _this.cameraIndex = 1
            } else {
              _this.camera = _this.pCamera
              _this.cameraIndex = 0
            }
          }
        }
        // 相机的position属性，name 加别名
        gui.add(this.camera.position, 'x').min(-10).max(10).step(0.1).name('positionX')
        // gui.add(this.camera.position, 'x', 0.1, 10, 0.1).name('positionX')
        // gui.add(this.camera.rotation, 'x', 0.1, 10, 0.1).name('rotationX')
        // 近平面
        gui.add(this.camera, 'near', 0.01, 10, 0.01).onChange(val => {
          this.camera.near = val
          this.camera.updateProjectionMatrix();
        })
        // 远平面
        gui.add(this.camera, 'far', 1, 100, 1).onChange(val => {
          this.camera.far = val
          this.camera.updateProjectionMatrix();
        })
        // 缩放
        gui.add(this.camera, 'zoom', 0.1, 10, 0.1).onChange(val => {
          this.camera.zoom = val
          this.camera.updateProjectionMatrix();
        })
        // 相机的fov属性 是Boolean选项
        gui.add(parmas, 'wireframe').onChange(val => {
          this.mesh.material.wireframe = val
        })
        // 
        gui.add(this.camera, 'fov', 40, 150, 1).onChange(val => {
          this.camera.fov = val;
          this.camera.updateProjectionMatrix();
        })
        gui.add(parmas, 'switchCamera')
        // 颜色控件
        gui.addColor(parmas, 'color').onChange(val => {
          console.log(val, _this.mesh);
          _this.mesh.material.color.set(val)
        })
      },
      helpers() { // 创建辅助坐标系
        // 创建辅助坐标系
        const axesHelper = new THREE.AxesHelper()
        // 创建辅助平面
        // const gridHelper = new THREE.GridHelper()
        // 创建相机辅助器
        const cameraHelper = new THREE.CameraHelper(this.pCamera)

        this.sence.add(axesHelper, cameraHelper)
        this.cameraHelper = cameraHelper

      },
      render() {//渲染器

        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          // 1.1 解决锯齿：抗锯齿效果
          antialias: true,
        })

        // 1.2 设置渲染器屏幕像素比，提高渲染精度
        renderer.setPixelRatio(window.devicePixelRatio || 1)

        // 设置渲染器大小
        renderer.setSize(this.width, this.height)
        // 执行渲染
        renderer.render(this.sence, this.camera)
        this.renderer = renderer
      },
      controls() {//控制器
        // 创建轨道控制器,实际是通过鼠标控制相机的位置
        const orbitControls = new OrbitControls(this.camera, this.canvas)

        // 惯性属性
        orbitControls.enableDamping = true
        this.orbitControls = orbitControls
      },
      tick() {//动画
        // this.mesh.rotation.y += 0.01
        this.orbitControls.update();
        this.renderer.render(this.sence, this.camera)
        window.requestAnimationFrame(() => this.tick());
      },
      fitView() {//屏幕自适应
        window.addEventListener('resize', () => {
          // 根据屏幕宽高比重新设置aspect属性
          this.camera.aspect = window.innerWidth / window.innerHeight;
          // 调用相机投影矩阵更新函数
          this.camera.updateProjectionMatrix();
          // 更新渲染器大小
          this.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false)
      },
      init() {
        this.createScene()
        this.createLights()
        this.createObjects()
        this.createCamera()
        this.helpers()
        this.render()
        this.controls()
        this.tick()
        this.fitView()
        this.datGui()
      }
    }

    $.init()

  }, []);

  return <>
    {/* start your project */}
    <canvas id="c" />;
  </>
};

export default Page;
