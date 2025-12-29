import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ParticleWave() {
    const ref = useRef<any>()
    const { mouse, viewport } = useThree()

    // Generate particles in a grid/wave pattern
    const count = 10000
    const positions = useMemo(() => {
        const positions = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 25
            const z = (Math.random() - 0.5) * 25
            const y = (Math.random() - 0.5) * 2
            positions[i * 3] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z
        }
        return positions
    }, [])

    // Store original positions to calculate waves from
    const originalPositions = useMemo(() => positions.slice(), [positions])

    useFrame((state) => {
        if (!ref.current) return

        const time = state.clock.getElapsedTime()
        const positions = ref.current.geometry.attributes.position.array

        // Get scroll position (normalized)
        const scrollY = window.scrollY * 0.001

        // Mouse influence
        const mouseX = (mouse.x * viewport.width) / 2
        const mouseY = (mouse.y * viewport.height) / 2

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            const x = originalPositions[i3]
            const z = originalPositions[i3 + 2]

            // Calculate distance from mouse for interaction
            const dx = x - mouseX
            const dz = z - (-mouseY * 2) // Approximate projection
            const dist = Math.sqrt(dx * dx + dz * dz)

            // Mouse repulsion/attraction wave
            const mouseWave = Math.max(0, 5 - dist) * Math.sin(time * 2 - dist) * 0.5

            // Complex wave function
            positions[i3 + 1] =
                Math.sin(x * 0.3 + time * 0.5 + scrollY) * 0.5 +
                Math.sin(z * 0.2 + time * 0.4 + scrollY) * 0.5 +
                Math.sin((x + z) * 0.1 + time * 0.2) * 0.2 +
                mouseWave // Add mouse interaction

            // Scroll effect: Move particles forward/backward based on scroll
            // This gives the "infinite" tunnel feeling when scrolling
            positions[i3 + 2] = z + (scrollY * 2) % 20
        }

        ref.current.geometry.attributes.position.needsUpdate = true

        // Rotate the entire system slowly
        ref.current.rotation.y = time * 0.02 + (mouse.x * 0.05)
    })

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#F472B6"
                size={0.025}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                opacity={0.5}
            />
        </Points>
    )
}

const ThreeBackground = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
            <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
                <fog attach="fog" args={['#050505', 5, 20]} />
                <ParticleWave />
            </Canvas>
        </div>
    )
}

export default ThreeBackground
