import * as THREE from "three";
import { ACESFilmicToneMapping, Vector2 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

export default function example() {
  // Renderer
  const canvas = document.querySelector("#three-canvas");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight
  );
  camera.position.y = 1.5;
  camera.position.z = 6;
  scene.add(camera);

  // Light
  const ambientLight = new THREE.AmbientLight("white", 0.6);

  const directionalLight = new THREE.PointLight("white", 0.2);
  directionalLight.position.set(-2, 10, 2);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize = new Vector2(7680, 7680);
  directionalLight.shadow.normalBias = 0.04;

  scene.add(directionalLight, ambientLight);

  //HDRI
  new RGBELoader().load("/resources/shanghai_bund_4k.pic", (hdrmap) => {
    hdrmap.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = hdrmap;
    scene.environment = hdrmap;

    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.7;
  });

  // Controls

  const orbitcontrols = new OrbitControls(camera, renderer.domElement);

  // gltf loader

  let mixer;

  const gltfLoader = new GLTFLoader();
  gltfLoader.load("/resources/OfficeChair.glb", (gltf) => {
    const meshChair = gltf.scene.children[0];
    meshChair.position.set(0, 0, 0);
    meshChair.rotateY(10);

    meshChair.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    scene.add(meshChair);

    mixer = new THREE.AnimationMixer(meshChair);
    const animationPlay = mixer.clipAction(gltf.animations[0]);
    animationPlay.play();
  });

  // 그리기

  const clock = new THREE.Clock();

  function loop() {
    const Time = clock.getDelta();
    if (mixer) {
      mixer.update(Time / 1.5);
    }

    renderer.render(scene, camera);
    renderer.setAnimationLoop(loop);
  }

  loop();

  function setSize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
  }

  // 이벤트
  window.addEventListener("resize", setSize);
}
