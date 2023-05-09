import { useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { HeartCurve } from 'three/examples/jsm/curves/CurveExtras'
import * as dat from 'dat.gui';

/**
 * 3-1 几何体属性与动画库
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
        // 创建球体 32改成16，球体没有那么圆润了
        const geometry = new THREE.SphereGeometry(1, 32, 64)

        // 2.1 更换对光照敏感的材质对象,要有光照才能看到
        const material = new THREE.MeshLambertMaterial({
          color: 0x1890ff,
          // wireframe: true,
        })
        // 创建3D物体对象 网格对象
        const mesh = new THREE.Mesh(geometry, material)

        this.sence.add(mesh)

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
        console.log(_this.mesh.geometry);
        // TODO
        const params = {
          x: 0,
          widthSegments: _this.mesh.geometry.parameters.widthSegments,
          heightSegments: _this.mesh.geometry.parameters.heightSegments,
          generateGeometry: function () {
            _this.mesh.geometry.dispose()
            const geometry = new THREE.SphereGeometry(1, params.widthSegments, params.heightSegments)
            _this.mesh.geometry = geometry
          },
          rotation() {
            // _this.mesh.rotation.x += 30
            // 绕y轴旋转半周
            gsap.to(_this.mesh.rotation, { duration: 1, delay: 0, y: _this.mesh.rotation.y + Math.PI });
          }
        }
        gui.add(_this.orbitControls, 'enabled')
        gui.add(_this.mesh, 'visible')
        gui.add(_this.mesh.material, 'wireframe')
        gui.add(params, 'widthSegments', 3, 100, 1).onChange(val => {
          params.widthSegments = val
          params.generateGeometry()
        })

        gui.add(params, 'heightSegments', 3, 100, 1).onChange(val => {
          params.heightSegments = val
          params.generateGeometry()
        })
        gui.add(params, 'rotation')
        gui.add(_this.mesh.position, 'x', -3, 3, 0.1)
        gui.add(params, 'x', -3, 3, 0.1).name('tranlateX').onChange(val => {
          params.x = val
          _this.mesh.geometry.translate(params.x, 0, 0)//相对运动累加的
          console.log(_this.mesh.geometry);
          console.log(_this.mesh.position);
        })
        // 缩放
        gui.add(_this.mesh.scale, 'x', 0, 3, 0.1).name('scaleX')
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
        const dragControls = new DragControls([this.mesh], this.camera, this.canvas)

        // 惯性属性
        orbitControls.enabled = false
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
