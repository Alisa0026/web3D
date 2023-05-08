import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { HeartCurve } from 'three/examples/jsm/curves/CurveExtras'
import * as dat from 'dat.gui';

/**
 * 3-0-1 认识几何体1
 */
const Page = () => {
  useEffect(() => {

    const $ = {
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

        const geometry = new THREE.BufferGeometry();
        // 创建简单的矩形. 在这里我们左上和右下顶点被复制了两次。
        const vertices = new Float32Array([
          -1.0, -1.0, 1.0, // 第1个顶点 (xyz)
          1.0, -1.0, 1.0, // 第2个顶点 (xyz)
          1.0, 1.0, 1.0, // 第3个顶点 (xyz)

          1.0, 1.0, 1.0, // 第4个...
          -1.0, 1.0, 1.0,
          -1.0, -1.0, 1.0,
        ]);

        // 第二个参数 3 表示每个顶点都是三个值构成。
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3)); // 这里是告诉几何体这组数据就是顶点的坐标信息

        // 设置表面颜色
        const material = new THREE.MeshBasicMaterial({
          color: '#1890ff',
          // wireframe: true,
        });

        // 创建3D物体对象 网格对象
        const mesh = new THREE.Mesh(geometry, material)

        // PlaneGeometry 是对 Float32Array的封装
        // const plane = new THREE.PlaneGeometry(); 
        const plane = new THREE.BoxGeometry(1, 1, 1);
        const mesh1 = new THREE.Mesh(plane, material)


        this.sence.add(mesh, mesh1)
        this.mesh = mesh
      },
      createCamera() { // 创建相机
        const aspect = this.width / this.height
        const pCamera = new THREE.PerspectiveCamera(
          75, aspect, 0.1, 1000
        )

        pCamera.position.set(0, 1, 5)
        pCamera.lookAt(this.sence.position)
        this.sence.add(pCamera)
        this.pCamera = pCamera
        this.camera = pCamera

      },
      datGui() {
        const _this = this
        const gui = new dat.GUI();
        gui.add(_this.orbitControls, 'enabled')

      },
      helpers() { // 创建辅助坐标系
        // 创建辅助坐标系
        const axesHelper = new THREE.AxesHelper()

        this.sence.add(axesHelper)

      },
      render() {//渲染器

        if (!this.renderer) {
          // 创建渲染器
          this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            // 1.1 解决锯齿：抗锯齿效果
            antialias: true,
          })

          // 1.2 设置渲染器屏幕像素比，提高渲染精度
          this.renderer.setPixelRatio(window.devicePixelRatio || 1)

          // 设置渲染器大小
          this.renderer.setSize(this.width, this.height)
          // 执行渲染
          this.renderer.render(this.sence, this.camera)
        }
      },
      controls() {//控制器
        // 创建轨道控制器,实际是通过鼠标控制相机的位置
        const orbitControls = new OrbitControls(this.camera, this.canvas)

        // 惯性属性
        orbitControls.enableDamping = true
        this.orbitControls = orbitControls
      },
      tick() {//动画
        this.orbitControls.update();
        // TODO 缩略图这里要执行render方法
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
        this.fitView()
        this.datGui()
        this.tick()
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
