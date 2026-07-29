import * as THREE from 'three';

export interface PartInfo {
  name: string;
  description: string;
  confidence: string; // 'high' | 'medium' | 'low' | 'inferred'
}

export interface NamedPart {
  id: string;
  object3D: THREE.Object3D;
  info: PartInfo;
  originalPosition: THREE.Vector3;
}

function makeMaterial(color: number, roughness: number, metalness: number = 0): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
  });
}

export function buildLobsterDog(): { group: THREE.Group; parts: NamedPart[] } {
  const group = new THREE.Group();
  group.name = 'lobster-dog-root';
  const parts: NamedPart[] = [];
  const red = 0xff0000;
  const darkRed = 0xcc0000;
  const white = 0xffffff;
  const offWhite = 0xf0f0f0;
  const black = 0x000000;
  const pink = 0xffc0cb;
  const veryDarkRed = 0x8b0000;

  const matWhiteFur = makeMaterial(white, 0.85);
  const matRedPlastic = makeMaterial(red, 0.4);
  const matDarkRed = makeMaterial(darkRed, 0.5);
  const matWhiteHighlight = makeMaterial(white, 0.2);
  const matBlack = makeMaterial(black, 0.1);
  const matPink = makeMaterial(pink, 0.6);
  const matSeam = makeMaterial(veryDarkRed, 0.6);

  function addPart(
    id: string,
    mesh: THREE.Mesh,
    position: [number, number, number],
    parent: THREE.Object3D,
    info: PartInfo
  ): void {
    const pivot = new THREE.Group();
    pivot.name = id;
    mesh.position.set(position[0], position[1], position[2]);
    mesh.userData.isPart = true;
    mesh.userData.partId = id;
    pivot.add(mesh);
    parent.add(pivot);

    const worldPos = new THREE.Vector3();
    pivot.getWorldPosition(worldPos);
    parts.push({
      id,
      object3D: pivot,
      info,
      originalPosition: worldPos.clone(),
    });
  }

  // === HEAD / HOOD ===
  const headGroup = new THREE.Group();
  headGroup.name = 'head';
  group.add(headGroup);

  // Dog head (white fur ball)
  const headGeo = new THREE.SphereGeometry(0.55, 24, 24);
  const headMesh = new THREE.Mesh(headGeo, matWhiteFur);
  headMesh.scale.set(1, 0.95, 0.8);
  addPart('head-dog', headMesh, [0, 1.2, 0], headGroup, {
    name: 'Dog Head',
    description: 'White fur, West Highland Terrier face',
    confidence: 'high',
  });

  // Hood cap (red dome on top of head)
  const hoodGeo = new THREE.SphereGeometry(0.5, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  const hoodMesh = new THREE.Mesh(hoodGeo, matRedPlastic);
  hoodMesh.scale.set(1, 0.25, 0.85);
  hoodMesh.rotation.x = Math.PI;
  addPart('hood-cap', hoodMesh, [0, 1.55, 0], headGroup, {
    name: 'Lobster Hood',
    description: 'Red lobster headpiece covering the top of the dog\'s head',
    confidence: 'high',
  });

  // Hood lobster eyes (white stalks with black pupils)
  for (let side = -1; side <= 1; side += 2) {
    const eyeStalk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.08, 8), matRedPlastic);
    addPart(`hood-eye-stalk-${side > 0 ? 'right' : 'left'}`, eyeStalk, [side * 0.18, 1.65, 0.15], headGroup, {
      name: `Hood Eye Stalk (${side > 0 ? 'Right' : 'Left'})`,
      description: 'Red stalk holding the lobster eye',
      confidence: 'high',
    });

    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), matWhiteHighlight);
    addPart(`hood-eye-white-${side > 0 ? 'right' : 'left'}`, eyeWhite, [side * 0.18, 1.7, 0.15], headGroup, {
      name: `Hood Eye White (${side > 0 ? 'Right' : 'Left'})`,
      description: 'White sclera of lobster eye',
      confidence: 'high',
    });

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), matBlack);
    addPart(`hood-eye-pupil-${side > 0 ? 'right' : 'left'}`, pupil, [side * 0.18, 1.7, 0.19], headGroup, {
      name: `Hood Eye Pupil (${side > 0 ? 'Right' : 'Left'})`,
      description: 'Black pupil of lobster hood eye',
      confidence: 'high',
    });
  }

  // Antennae (curved red tubes)
  for (let side = -1; side <= 1; side += 2) {
    const antMat = makeMaterial(red, 0.3);
    const antGeo = new THREE.CylinderGeometry(0.015, 0.03, 0.35, 6);
    const ant = new THREE.Mesh(antGeo, antMat);
    ant.rotation.z = side * 0.3;
    ant.rotation.x = -0.15;
    addPart(`antenna-${side > 0 ? 'right' : 'left'}`, ant, [side * 0.1, 1.75, 0.05], headGroup, {
      name: `${side > 0 ? 'Right' : 'Left'} Antenna`,
      description: 'Red lobster antenna curving upward',
      confidence: 'medium',
    });

    // Antenna tip (white)
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), matWhiteHighlight);
    addPart(`antenna-tip-${side > 0 ? 'right' : 'left'}`, tip, [side * 0.12, 1.95, 0.02], headGroup, {
      name: `${side > 0 ? 'Right' : 'Left'} Antenna Tip`,
      description: 'White highlight at antenna tip',
      confidence: 'high',
    });
  }

  // === DOG FACE DETAILS ===
  const faceGroup = new THREE.Group();
  faceGroup.name = 'face';
  headGroup.add(faceGroup);

  // Left eye
  const eyeGeo = new THREE.SphereGeometry(0.04, 10, 10);
  const le = new THREE.Mesh(eyeGeo, matBlack);
  addPart('eye-left', le, [-0.12, 1.15, 0.38], faceGroup, {
    name: 'Left Eye',
    description: 'Black glossy left eye',
    confidence: 'high',
  });

  // Right eye
  const re = new THREE.Mesh(eyeGeo, matBlack);
  addPart('eye-right', re, [0.12, 1.15, 0.38], faceGroup, {
    name: 'Right Eye',
    description: 'Black glossy right eye',
    confidence: 'high',
  });

  // Eye highlights (tiny white specular dots)
  for (let side = -1; side <= 1; side += 2) {
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), matWhiteHighlight);
    addPart(`eye-highlight-${side > 0 ? 'right' : 'left'}`, hl, [side * 0.1, 1.17, 0.41], faceGroup, {
      name: `Eye Highlight (${side > 0 ? 'Right' : 'Left'})`,
      description: 'White specular highlight on eye',
      confidence: 'high',
    });
  }

  // Nose (black triangular)
  const noseGeo = new THREE.ConeGeometry(0.035, 0.03, 4);
  const nose = new THREE.Mesh(noseGeo, matBlack);
  nose.rotation.x = Math.PI / 2;
  addPart('nose', nose, [0, 1.05, 0.4], faceGroup, {
    name: 'Nose',
    description: 'Small black triangular nose',
    confidence: 'high',
  });

  // Tongue (pink sticking out to left)
  const tongueGeo = new THREE.SphereGeometry(0.025, 8, 8);
  const tongue = new THREE.Mesh(tongueGeo, matPink);
  tongue.scale.set(1.2, 0.7, 0.6);
  addPart('tongue', tongue, [-0.07, 0.99, 0.4], faceGroup, {
    name: 'Tongue',
    description: 'Pink tongue sticking out to the side',
    confidence: 'high',
  });

  // === TORSO (segmented red body) ===
  const torsoGroup = new THREE.Group();
  torsoGroup.name = 'torso';
  group.add(torsoGroup);

  // Main torso body
  const torsoGeo = new THREE.CylinderGeometry(0.5, 0.55, 0.7, 16);
  const torsoMesh = new THREE.Mesh(torsoGeo, matRedPlastic);
  torsoMesh.scale.set(1, 1, 0.7);
  addPart('torso-body', torsoMesh, [0, 0.55, 0], torsoGroup, {
    name: 'Torso Body',
    description: 'Main red lobster costume body',
    confidence: 'high',
  });

  // Torso segmented plates (5 horizontal lines)
  for (let i = 0; i < 5; i++) {
    const yPos = -0.28 + i * 0.14;
    const seg = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.015, 6, 20),
      matDarkRed
    );
    seg.rotation.x = Math.PI / 2;
    seg.scale.set(1, 1, 0.7);
    addPart(`torso-segment-${i}`, seg, [0, yPos + 0.55, 0], torsoGroup, {
      name: `Torso Segment ${i + 1}`,
      description: 'Horizontal armor plate on lobster costume',
      confidence: 'high',
    });
  }

  // Center seam
  const seam = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, 0.65, 0.01),
    matSeam
  );
  addPart('torso-center-seam', seam, [0, 0.55, 0.43], torsoGroup, {
    name: 'Center Seam',
    description: 'Vertical closure seam down the center of the costume',
    confidence: 'medium',
  });

  // White spots (3 on each side)
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      const spot = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 8, 8),
        matWhiteHighlight
      );
      addPart(`spot-${side > 0 ? 'right' : 'left'}-${i}`, spot,
        [side * 0.15, 0.4 + i * 0.15, 0.44], torsoGroup, {
        name: `${side > 0 ? 'Right' : 'Left'} Spot ${i + 1}`,
        description: 'White decorative button/spot on the red costume',
        confidence: 'high',
      });
    }
  }

  // === LEFT ARM & CLAW ===
  const leftArmGroup = new THREE.Group();
  leftArmGroup.name = 'left-arm';
  group.add(leftArmGroup);

  const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.3, 8), matRedPlastic);
  lArm.rotation.z = -0.3;
  addPart('left-arm', lArm, [-0.6, 0.7, 0], leftArmGroup, {
    name: 'Left Arm',
    description: 'Red segmented lobster arm',
    confidence: 'high',
  });

  // Left claw (pincer)
  const leftClawGroup = new THREE.Group();
  leftClawGroup.name = 'left-claw';
  leftArmGroup.add(leftClawGroup);

  const lClawUpper = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.06), matRedPlastic);
  lClawUpper.geometry.translate(-0.05, 0, 0);
  addPart('left-claw-upper', lClawUpper, [-0.8, 0.55, 0], leftClawGroup, {
    name: 'Left Claw (Upper)',
    description: 'Upper pincer of the left lobster claw',
    confidence: 'medium',
  });

  const lClawLower = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.05), makeMaterial(0xcc0000, 0.4));
  lClawLower.geometry.translate(-0.03, 0, 0);
  addPart('left-claw-lower', lClawLower, [-0.78, 0.5, 0], leftClawGroup, {
    name: 'Left Claw (Lower)',
    description: 'Lower pincer of the left lobster claw',
    confidence: 'medium',
  });

  // Claw highlight
  const lCh = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), matWhiteHighlight);
  addPart('left-claw-highlight', lCh, [-0.72, 0.58, 0.04], leftClawGroup, {
    name: 'Left Claw Highlight',
    description: 'White specular highlight on the claw',
    confidence: 'high',
  });

  // === RIGHT ARM & CLAW ===
  const rightArmGroup = new THREE.Group();
  rightArmGroup.name = 'right-arm';
  group.add(rightArmGroup);

  const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.3, 8), matRedPlastic);
  rArm.rotation.z = 0.3;
  addPart('right-arm', rArm, [0.6, 0.7, 0], rightArmGroup, {
    name: 'Right Arm',
    description: 'Red segmented lobster arm',
    confidence: 'high',
  });

  const rightClawGroup = new THREE.Group();
  rightClawGroup.name = 'right-claw';
  rightArmGroup.add(rightClawGroup);

  const rClawUpper = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.06), matRedPlastic);
  rClawUpper.geometry.translate(0.05, 0, 0);
  addPart('right-claw-upper', rClawUpper, [0.8, 0.55, 0], rightClawGroup, {
    name: 'Right Claw (Upper)',
    description: 'Upper pincer of the right lobster claw',
    confidence: 'medium',
  });

  const rClawLower = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.05), makeMaterial(0xcc0000, 0.4));
  rClawLower.geometry.translate(0.03, 0, 0);
  addPart('right-claw-lower', rClawLower, [0.78, 0.5, 0], rightClawGroup, {
    name: 'Right Claw (Lower)',
    description: 'Lower pincer of the right lobster claw',
    confidence: 'medium',
  });

  const rCh = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), matWhiteHighlight);
  addPart('right-claw-highlight', rCh, [0.72, 0.58, 0.04], rightClawGroup, {
    name: 'Right Claw Highlight',
    description: 'White specular highlight on the claw',
    confidence: 'high',
  });

  // === LEGS ===
  const legsGroup = new THREE.Group();
  legsGroup.name = 'legs';
  group.add(legsGroup);

  // Left leg
  const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.12, 8), matRedPlastic);
  addPart('left-leg', lLeg, [-0.15, 0.12, 0], legsGroup, {
    name: 'Left Leg',
    description: 'Red lobster costume leg',
    confidence: 'medium',
  });

  // Right leg
  const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.12, 8), matRedPlastic);
  addPart('right-leg', rLeg, [0.15, 0.12, 0], legsGroup, {
    name: 'Right Leg',
    description: 'Red lobster costume leg',
    confidence: 'medium',
  });

  // Left foot (pointed)
  const lFoot = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.06, 6), matRedPlastic);
  lFoot.rotation.x = Math.PI / 2;
  addPart('left-foot', lFoot, [-0.15, 0.06, 0.02], legsGroup, {
    name: 'Left Foot',
    description: 'Pointed lobster-style foot',
    confidence: 'medium',
  });

  // Right foot
  const rFoot = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.06, 6), matRedPlastic);
  rFoot.rotation.x = Math.PI / 2;
  addPart('right-foot', rFoot, [0.15, 0.06, 0.02], legsGroup, {
    name: 'Right Foot',
    description: 'Pointed lobster-style foot',
    confidence: 'medium',
  });

  // === TAIL ===
  const tailGroup = new THREE.Group();
  tailGroup.name = 'tail';
  group.add(tailGroup);

  const tailGeo = new THREE.CylinderGeometry(0.08, 0.15, 0.2, 8);
  const tailMesh = new THREE.Mesh(tailGeo, matRedPlastic);
  addPart('tail-base', tailMesh, [0, 0.05, -0.35], tailGroup, {
    name: 'Tail Base',
    description: 'Lobster tail base (partially occluded in reference)',
    confidence: 'low',
  });

  // Tail segments
  for (let i = 0; i < 3; i++) {
    const seg = new THREE.Mesh(
      new THREE.TorusGeometry(0.12 - i * 0.02, 0.015, 6, 10),
      matDarkRed
    );
    seg.rotation.x = Math.PI / 2 + 0.1;
    addPart(`tail-segment-${i}`, seg, [0, 0.03 - i * 0.06, -0.35 - i * 0.04], tailGroup, {
      name: `Tail Segment ${i + 1}`,
      description: 'Segmented lobster tail plate (inferred)',
      confidence: 'low',
    });
  }

  // Update all original positions to world space
  for (const part of parts) {
    const wp = new THREE.Vector3();
    part.object3D.getWorldPosition(wp);
    part.originalPosition.copy(wp);
  }

  return { group, parts };
}
