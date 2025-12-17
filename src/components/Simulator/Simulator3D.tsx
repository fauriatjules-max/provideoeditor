import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  Sky,
  PerspectiveCamera,
  Grid,
  Stats
} from '@react-three/drei'
import { Physics, useBox, usePlane } from '@react-three/cannon'
import { Suspense, useRef, useState } from 'react'
import * as THREE from 'three'
import { CarModel } from './CarModel'
import { TrackModel } from './TrackModel'

// Composant Voiture Physique
function CarPhysics({ position = [0, 0.5, 0] }: { position?: [number, number, number] }) {
  const [ref, api] = useBox(() => ({
    mass: 1000,
    position,
    rotation: [0, 0, 0],
    args: [1.8, 0.5, 4]
  }))

  const { camera } = useThree()
  const velocity = useRef([0, 0, 0])
  const rotation = useRef([0, 0, 0])

  // Contrôles clavier
  useState(() => {
    const keyDown = (e: KeyboardEvent) => {
      const force = 100
      switch(e.key.toLowerCase()) {
        case 'arrowup':
        case 'z':
          api.applyForce([0, 0, -force], [0, 0, 0])
          break
        case 'arrowdown':
        case 's':
          api.applyForce([0, 0, force], [0, 0, 0])
          break
        case 'arrowleft':
        case 'q':
          api.applyForce([-force, 0, 0], [0, 0, 0])
          break
        case 'arrowright':
        case 'd':
          api.applyForce([force, 0, 0], [0, 0, 0])
          break
      }
    }

    window.addEventListener('keydown', keyDown)
    return () => window.removeEventListener('keydown', keyDown)
  })

  // Suivi de la caméra
  useFrame(() => {
    if (ref.current) {
      const carPosition = ref.current.position
      camera.position.lerp(
        new THREE.Vector3(
          carPosition.x - 10,
          carPosition.y + 5,
          carPosition.z + 10
        ),
        0.1
      )
      camera.lookAt(carPosition.x, carPosition.y, carPosition.z)
    }
  })

  return (
    <mesh ref={ref as any}>
      <boxGeometry args={[1.8, 0.5, 4]} />
      <meshStandardMaterial color="red" />
      <CarModel />
    </mesh>
  )
}

// Sol
function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0]
  }))

  return (
    <mesh ref={ref as any}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#2d3748" />
    </mesh>
  )
}

// Interface du simulateur
interface Simulator3DProps {
  trackId: string
  carModel: string
  weather: 'clear' | 'rain' | 'snow'
  timeOfDay: 'day' | 'night'
  onStatsUpdate?: (stats: any) => void
}

export default function Simulator3D({
  trackId,
  carModel,
  weather,
  timeOfDay,
  onStatsUpdate
}: Simulator3DProps) {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden border-2 border-gray-700">
      {/* Contrôles overlay */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="px-4 py-2 bg-gray-800/80 backdrop-blur-sm rounded-lg text-white hover:bg-gray-700 transition-colors"
        >
          {isPaused ? '▶️ Reprendre' : '⏸️ Pause'}
        </button>
        <button className="px-4 py-2 bg-red-600/80 backdrop-blur-sm rounded-lg text-white hover:bg-red-500 transition-colors">
          🔄 Recommencer
        </button>
      </div>

      {/* Canvas Three.js */}
      <Canvas shadows>
        <Suspense fallback={null}>
          {/* Environnement */}
          <Environment
            files={
              timeOfDay === 'day'
                ? '/environments/sunset.hdr'
                : '/environments/night.hdr'
            }
            background
          />
          
          {/* Éclairage */}
          {timeOfDay === 'day' ? (
            <>
              <directionalLight
                position={[10, 10, 5]}
                intensity={1}
                castShadow
                shadow-mapSize={[2048, 2048]}
              />
              <ambientLight intensity={0.3} />
            </>
          ) : (
            <>
              <directionalLight
                position={[-10, 10, -5]}
                intensity={0.5}
                color="#4f46e5"
              />
              <pointLight position={[0, 5, 0]} intensity={0.8} color="#3b82f6" />
            </>
          )}

          {/* Effets météo */}
          {weather === 'rain' && (
            <fog attach="fog" args={['#1e293b', 10, 50]} />
          )}
          {weather === 'snow' && (
            <fog attach="fog" args={['#ffffff', 5, 30]} />
          )}

          {/* Physique */}
          <Physics gravity={[0, -9.81, 0]}>
            <Ground />
            <CarPhysics />
            <TrackModel trackId={trackId} />
          </Physics>

          {/* Grille */}
          <Grid
            args={[100, 100]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#4b5563"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#374151"
            fadeDistance={50}
            fadeStrength={1}
          />

          {/* Contrôles caméra */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={50}
          />

          {/* Statistiques de debug (uniquement en dev) */}
          {process.env.NODE_ENV === 'development' && <Stats />}
        </Suspense>
      </Canvas>

      {/* HUD de simulation */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">0.00</div>
              <div className="text-xs text-gray-400">Temps au tour</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">0</div>
              <div className="text-xs text-gray-400">Km/h</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">1</div>
              <div className="text-xs text-gray-400">RPM (x1000)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">6</div>
              <div className="text-xs text-gray-400">Vitesse</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
