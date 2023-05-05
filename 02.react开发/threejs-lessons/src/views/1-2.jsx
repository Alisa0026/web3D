import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// 1.2 写一个立方体匀速运动，超过十个单位回到原点坐标

const Page = () => {
  useEffect(() => {
    const canvas = document.getElementById('c');

    const width = window.innerWidth
    const height = window.innerHeight

    canvas.width = width
    canvas.height = height


    // three.js

    /**
     * 1. 有锯齿
     * 2. 没有3D立体效果
     * 3. 6 个面能不能有不同颜色
     */

    // 创建3D场景对象
    const sence = new THREE.Scene()
    // 创建辅助坐标系
    const axesHelper = new THREE.AxesHelper()
    // 创建辅助平面
    const gridHelper = new THREE.GridHelper()

    sence.add(axesHelper, gridHelper)

    // 2.2 添加全局光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    // 2.3 添加方向光照，这样效果就比较立体了
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)

    sence.add(ambientLight, directionalLight)

    // 创建立方体的几何体
    const geometry = new THREE.BoxGeometry(1, 1, 1)

    const faces = []
    // 3.2 循环 groups，随机生成材质对象并给颜色，放到faces中，放到mesh中
    for (let i = 0; i < geometry.groups.length; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff * Math.random(),
      })
      faces.push(material)
    }

    const mesh = new THREE.Mesh(geometry, faces)

    sence.add(mesh)

    // 创建相机对象，透视相机:可以模拟人眼观察角度，近大远小
    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(45, aspect, 1)

    // 设置相机位置
    camera.position.set(2, 2, 3) // x:2 y:2 z:3
    // 设置相机的朝向
    camera.lookAt(sence.position)
    // 将相机添加到场景中
    sence.add(camera)

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      // 1.1 解决锯齿：抗锯齿效果
      antialias: true,
    })

    // 1.2 设置渲染器屏幕像素比，提高渲染精度
    renderer.setPixelRatio(window.devicePixelRatio || 1)

    // 设置渲染器大小
    renderer.setSize(width, height)
    // 执行渲染
    renderer.render(sence, camera)


    // 创建轨道控制器,实际是通过鼠标控制相机的位置
    const orbitControls = new OrbitControls(camera, canvas)

    let timestamp = Date.now()

    const tick = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - timestamp; // 渲染时间间隔

      timestamp = currentTime

      //elapsedTime/1000是将毫秒改为秒
      //1m/s的速度* 时间（秒）= 移动的距离
      //将当前位置+=移动的距离，即为最后的距离
      mesh.position.x += 1 * deltaTime / 1000

      if (mesh.position.x > 10) {
        mesh.position.x = 0
      }

      orbitControls.update();
      renderer.render(sence, camera)
      window.requestAnimationFrame(tick);

    }

    tick();

    window.addEventListener('resize', () => {
      // 根据屏幕宽高比重新设置aspect属性
      camera.aspect = window.innerWidth / window.innerHeight;
      // 调用相机投影矩阵更新函数
      camera.updateProjectionMatrix();
      // 更新渲染器大小
      renderer.setSize(window.innerWidth, window.innerHeight);
    })
  }, []);

  return <>
    {/* start your project */}
    <canvas id="c" />;
  </>
};

export default Page;
