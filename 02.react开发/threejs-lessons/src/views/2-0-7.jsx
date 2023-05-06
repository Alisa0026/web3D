import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { HeartCurve } from 'three/examples/jsm/curves/CurveExtras'
import * as dat from 'dat.gui';

/**
 * 2-0-7 多相机同步渲染
 * 1. 要裁剪两次（全局裁剪，缩略图裁剪），需要两个相机对象，裁剪别忘了执行渲染
 * 2. 裁剪前开启裁剪检测 setScissorTest
 * 3. 缩略图裁剪用的是 setViewport，不是setSize，这样两个图的坐标才能同步
 * 4. 渲染器tick 之前是手动调用 this.renderer.render，现在是调用自己render函数，因为分别裁剪，要调用2次，在各自的裁剪函数中执行渲染
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

        // TODO 创建缩略图相机
        const tumbnailCamera = new THREE.OrthographicCamera(-150 / 200 * frustumSize, 150 / 200 * frustumSize, frustumSize, -frustumSize, 0.1, 1000);// 和上面同理
        tumbnailCamera.position.set(0, 0, 2)
        tumbnailCamera.lookAt(this.sence.position)
        this.tumbnailCamera = tumbnailCamera
        this.sence.add(tumbnailCamera)
      },
      curveGenerator() { // TODO 生成曲线
        const curve = new HeartCurve(0.3)
        const tubeGeometry = new THREE.TubeGeometry(curve, 200, 0.1, 8, true)
        const material = new THREE.MeshBasicMaterial({
          color: 0xff0000,
        })
        const tubeMesh = new THREE.Mesh(tubeGeometry, material)
        // 把曲线分割成1000段
        this.points = curve.getPoints(1000)
        tubeMesh.rotation.x = - Math.PI / 2 //桃心绕x轴旋转90度

        // 曲线添加到画布
        this.sence.add(tubeMesh)
        this.curve = curve

        // 加个球体
        const sphereGeometry = new THREE.SphereGeometry(0.6, 32, 64)
        const sphereMaterial = new THREE.MeshBasicMaterial({
          color: 0xffff00,
        })
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
        sphereMesh.position.copy(this.pCamera.position)
        this.sence.add(sphereMesh)
        this.sphereMesh = sphereMesh
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
      clipScene(renderer) {// TODO 裁剪
        const dpr = window.devicePixelRatio || 1;
        // 裁剪
        renderer.setScissor(0, 0, this.width, this.height)
        // 设置裁剪区域背景色
        renderer.setClearColor(0x999999, 0.5)
        // renderer.setViewport(0, 0, this.width, this.height)

        // 设置渲染器屏幕像素比，提高渲染精度
        renderer.setPixelRatio(dpr)
        // 设置渲染器大小
        renderer.setSize(this.width, this.height)
        // 执行渲染
        renderer.render(this.sence, this.camera)
      },
      clipThumbnail(renderer) {// TODO 缩略图裁剪
        // 缩略区域的 w:150 h:200 margin:10
        // 缩略区域所在位置 w=width-150-10 h=height-200-10
        const w = this.width - 150 - 10
        // const h = this.height - 200 - 10

        // 更新位置
        this.tumbnailCamera.position.copy(this.camera.position)
        // 更新旋转
        // this.tumbnailCamera.rotation.copy(this.camera.rotation)
        // 更新四元数（更新渲染）
        this.tumbnailCamera.quaternion.copy(this.camera.quaternion)
        // 更新缩放
        this.tumbnailCamera.zoom = this.camera.zoom
        // 更新相机矩阵
        this.tumbnailCamera.updateProjectionMatrix()

        // 裁剪
        renderer.setScissor(w, 0, 150, 200)
        renderer.setViewport(w, 0, 150, 200) //坐标原点在左下角
        // 设置裁剪区域背景色
        renderer.setClearColor(0x000000)
        // 执行渲染
        renderer.render(this.sence, this.tumbnailCamera)

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

        // 裁剪
        this.renderer.setScissorTest(true)

        // TODO 全局裁剪
        this.clipScene(this.renderer)
        // TODO 缩略图
        this.clipThumbnail(this.renderer)
      },
      controls() {//控制器
        // 创建轨道控制器,实际是通过鼠标控制相机的位置
        const orbitControls = new OrbitControls(this.camera, this.canvas)

        // 惯性属性
        orbitControls.enableDamping = true
        this.orbitControls = orbitControls
        console.log(orbitControls);

        // TODO 拖拽控制器
        const dragControls = new DragControls([this.mesh], this.camera, this.canvas)

        dragControls.addEventListener('dragstart', () => {
          // 拖拽开始事件
          orbitControls.enabled = false
        })
        dragControls.addEventListener('dragend', () => {
          // 拖拽结束事件
          orbitControls.enabled = true
        })
      },
      tick() {//动画
        this.orbitControls.update();
        // TODO 缩略图这里要执行render方法
        this.render()
        // this.renderer.render(this.sence, this.camera)
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
