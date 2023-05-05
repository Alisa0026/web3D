# three.js 练习

## 1. 问题：
1. 正交相机没太看懂
2. 不能沿着x/z轴平面进行360度转圈


## 2. 总结内容
1. 创建的正方体，有锯齿：
   - 给渲染器 renderer 设置 antialias:true 处理锯齿
   -  设置渲染器屏幕像素比，提高渲染精度 renderer.setPixelRatio
2. 修改材质+光照产生立体效果
   - 更换对光照敏感的材质对象,要有光照才能看到 new THREE.MeshLambertMaterial()
   - 添加全局光照 AmbientLight
   - 添加方向光照，这样效果就比较立体了DirectionalLight
3. 6 个面能不能有不同颜色
   - geometry.groups 里是正方体的6个面，通过循环，给每个面设置不通材质
   - 放到faces数组中，然后给到 mesh
4. 计算时间数据  const clock = new THREE.Clock()
5. 生成辅助平面 new THREE.GridHelper()
6. 创建轨道控制器：
   `import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';`
   
7. 画布性能监控：
   `import Stats from 'three/examples/jsm/libs/stats.module'`
8. 屏幕自适应
```
    window.addEventListener( 'resize', function () {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}, false );
```

1.  
