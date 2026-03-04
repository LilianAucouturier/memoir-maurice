/**
 * Creates a stylized humanoid character from Three.js primitives.
 * Uses the global THREE object (loaded via script tag).
 */
class Character {
    constructor() {
        this.group = new THREE.Group();
        this.walkTime = 0;
        this.isMoving = false;
        this.isRunning = false;

        // Materials
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x4a6fa5,
            roughness: 0.4,
            metalness: 0.1
        });
        const skinMat = new THREE.MeshStandardMaterial({
            color: 0xf5cba7,
            roughness: 0.6,
            metalness: 0.0
        });
        const shoeMat = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.5,
            metalness: 0.2
        });
        const pantsMat = new THREE.MeshStandardMaterial({
            color: 0x34495e,
            roughness: 0.5,
            metalness: 0.1
        });
        const hairMat = new THREE.MeshStandardMaterial({
            color: 0x3b2417,
            roughness: 0.8,
            metalness: 0.0
        });
        const eyeMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.3,
            metalness: 0.0
        });

        // --- Head ---
        const headGeo = new THREE.SphereGeometry(0.22, 16, 16);
        this.head = new THREE.Mesh(headGeo, skinMat);
        this.head.position.y = 1.55;
        this.head.castShadow = true;
        this.group.add(this.head);

        // Hair
        const hairGeo = new THREE.SphereGeometry(0.235, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 1.57;
        hair.castShadow = true;
        this.group.add(hair);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.035, 8, 8);
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.08, 1.57, 0.19);
        this.group.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.08, 1.57, 0.19);
        this.group.add(rightEye);

        // --- Torso ---
        const torsoGeo = new THREE.CapsuleGeometry(0.17, 0.35, 8, 16);
        const torso = new THREE.Mesh(torsoGeo, bodyMat);
        torso.position.y = 1.15;
        torso.castShadow = true;
        this.group.add(torso);

        // --- Arms ---
        const armGeo = new THREE.CapsuleGeometry(0.055, 0.3, 6, 12);

        this.leftArmPivot = new THREE.Group();
        this.leftArmPivot.position.set(-0.25, 1.3, 0);
        const leftArm = new THREE.Mesh(armGeo, skinMat);
        leftArm.position.y = -0.2;
        leftArm.castShadow = true;
        this.leftArmPivot.add(leftArm);
        this.group.add(this.leftArmPivot);

        this.rightArmPivot = new THREE.Group();
        this.rightArmPivot.position.set(0.25, 1.3, 0);
        const rightArm = new THREE.Mesh(armGeo, skinMat);
        rightArm.position.y = -0.2;
        rightArm.castShadow = true;
        this.rightArmPivot.add(rightArm);
        this.group.add(this.rightArmPivot);

        // --- Legs ---
        const legGeo = new THREE.CapsuleGeometry(0.07, 0.32, 6, 12);

        this.leftLegPivot = new THREE.Group();
        this.leftLegPivot.position.set(-0.1, 0.78, 0);
        const leftLeg = new THREE.Mesh(legGeo, pantsMat);
        leftLeg.position.y = -0.22;
        leftLeg.castShadow = true;
        this.leftLegPivot.add(leftLeg);
        this.group.add(this.leftLegPivot);

        this.rightLegPivot = new THREE.Group();
        this.rightLegPivot.position.set(0.1, 0.78, 0);
        const rightLeg = new THREE.Mesh(legGeo, pantsMat);
        rightLeg.position.y = -0.22;
        rightLeg.castShadow = true;
        this.rightLegPivot.add(rightLeg);
        this.group.add(this.rightLegPivot);

        // --- Feet ---
        const footGeo = new THREE.BoxGeometry(0.12, 0.06, 0.2);
        footGeo.translate(0, 0, 0.03);

        const leftFoot = new THREE.Mesh(footGeo, shoeMat);
        leftFoot.position.y = -0.4;
        leftFoot.castShadow = true;
        this.leftLegPivot.add(leftFoot);

        const rightFoot = new THREE.Mesh(footGeo, shoeMat);
        rightFoot.position.y = -0.4;
        rightFoot.castShadow = true;
        this.rightLegPivot.add(rightFoot);

        // Shadow
        this.group.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Movement state
        this.velocity = new THREE.Vector3();
        this.rotation = 0;
        this.group.position.y = 0;
    }

    update(deltaTime) {
        if (this.isMoving) {
            const speed = this.isRunning ? 12 : 7;
            this.walkTime += deltaTime * speed;

            const swingAngle = this.isRunning ? 0.7 : 0.45;

            this.leftLegPivot.rotation.x = Math.sin(this.walkTime) * swingAngle;
            this.rightLegPivot.rotation.x = Math.sin(this.walkTime + Math.PI) * swingAngle;

            this.leftArmPivot.rotation.x = Math.sin(this.walkTime + Math.PI) * swingAngle * 0.6;
            this.rightArmPivot.rotation.x = Math.sin(this.walkTime) * swingAngle * 0.6;

            this.head.position.y = 1.55 + Math.sin(this.walkTime * 2) * 0.015;
            this.group.position.y = Math.abs(Math.sin(this.walkTime)) * 0.03;
        } else {
            this.walkTime = 0;
            this.leftLegPivot.rotation.x *= 0.85;
            this.rightLegPivot.rotation.x *= 0.85;
            this.leftArmPivot.rotation.x *= 0.85;
            this.rightArmPivot.rotation.x *= 0.85;
            this.head.position.y += (1.55 - this.head.position.y) * 0.1;
            this.group.position.y *= 0.85;

            const breath = Math.sin(Date.now() * 0.003) * 0.005;
            this.group.position.y += breath;
        }
    }

    getObject() {
        return this.group;
    }
}
