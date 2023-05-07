import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { HeartCurve } from 'three/examples/jsm/curves/CurveExtras'
import * as dat from 'dat.gui';

/**
 * 使用正交相机拍摄立方体自转
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
        // 2.1 更换对光照敏感的材质对象,要有光照才能看到
        const material = new THREE.MeshLambertMaterial({
          color: 0x1890ff,
          // wireframe: true,
        })
        // 创建3D物体对象 网格对象
        const mesh = new THREE.Mesh(geometry, material)

        mesh.geometry.computeBoundingBox();

        this.sence.add(mesh)
        this.mesh = mesh
      },
      createCamera() { // 创建相机
        const frustumSize = 2 // 设置显示相机前方高为4的内容,解决正交相机和屏幕适配问题
        const aspect = this.width / this.height
        const pCamera = new THREE.OrthographicCamera(
          -aspect * frustumSize, aspect * frustumSize, frustumSize, -frustumSize, 0.1, 1000
        )

        pCamera.position.set(1, 1, 2)
        pCamera.lookAt(this.sence.position)
        this.sence.add(pCamera)
        this.pCamera = pCamera
        this.camera = pCamera
      },
      datGui() {
        const _this = this
        const gui = new dat.GUI();

        gui.add(_this.orbitControls, 'enabled')
        gui.add(_this.orbitControls, 'dampingFactor', 0.01, 0.2, 0.01) // 阻尼系数
        gui.add(_this.orbitControls, 'enablePan') // 启用/禁用相机平移
        gui.add(_this.orbitControls, 'panSpeed', 1, 10, 1) // 相机平移速度
        gui.add(_this.orbitControls, 'autoRotate') // 相机绕着目标进行自动旋转
        gui.add(_this.orbitControls, 'autoRotateSpeed', 1, 10, 1) // 自动旋转速度
        gui.add(_this.orbitControls, 'enableZoom') // 缩放
        gui.add(_this.orbitControls, 'zoomSpeed', 1, 10, 1) // 缩放速度
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
          
        }


      },
      controls() {//控制器
        // 创建轨道控制器,实际是通过鼠标控制相机的位置
        const orbitControls = new OrbitControls(this.camera, this.canvas)

        // 惯性属性
        orbitControls.enableDamping = true
        this.orbitControls = orbitControls
        console.log(orbitControls);
      },
      tick() {//动画
        // 自转
        this.mesh.rotateY(0.01)

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
        this.fitView()
        // this.datGui()
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
