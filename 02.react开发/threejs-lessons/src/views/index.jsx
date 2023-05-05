import { useEffect } from 'react';
import * as THREE from 'three';

const Page = () => {
  useEffect(() => {
    console.log(THREE);
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

    sence.add(axesHelper)

    // 2.2 添加全局光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    // 2.3 添加方向光照，这样效果就比较立体了
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)

    sence.add(ambientLight, directionalLight)

    // 创建立方体的几何体
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    // 创建立方体的基础材质
    // const material = new THREE.MeshBasicMaterial({
    //   color: 0x1890ff,
    // })

    // 2.1 更换对光照敏感的材质对象,要有光照才能看到
    const material = new THREE.MeshLambertMaterial({
      color: 0x1890ff,
    })

    // 创建3D物体对象 网格对象
    const mesh = new THREE.Mesh(geometry, material)
    sence.add(mesh)

    // 创建相机对象，透视相机:可以模拟人眼观察角度，近大远小
    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(45, aspect, 1)

    // TODO:正交相机：参数是：左右上下前后
    // const camera = new THREE.OrthographicCamera(
    //   -aspect,
    //   aspect,
    //   aspect,
    //   -aspect,
    //   0.01,
    //   100
    // )

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
  }, []);

  return <>
    {/* start your project */}
    <canvas id="c" />;
  </>
};

export default Page;
