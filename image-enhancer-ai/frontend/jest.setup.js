import '@testing-library/jest-dom'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    img: 'img',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    p: 'p',
    span: 'span',
  },
  AnimatePresence: ({ children }) => children,
}))

// Mock react-compare-image
jest.mock('react-compare-image', () => {
  return function MockCompareImage({ leftImage, rightImage, leftImageLabel, rightImageLabel }) {
    return (
      <div data-testid="compare-image">
        <div data-testid="left-image">
          <img src={leftImage} alt={leftImageLabel} />
        </div>
        <div data-testid="right-image">
          <img src={rightImage} alt={rightImageLabel} />
        </div>
      </div>
    )
  }
})

// Mock window.alert
global.alert = jest.fn()

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url')
global.URL.revokeObjectURL = jest.fn()

// Mock File constructor
global.File = class File {
  constructor(chunks, filename, options = {}) {
    this.name = filename
    this.type = options.type || ''
    this.size = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  }
}

// Mock FormData
global.FormData = class FormData {
  constructor() {
    this.data = new Map()
  }
  
  append(key, value) {
    this.data.set(key, value)
  }
  
  get(key) {
    return this.data.get(key)
  }
  
  has(key) {
    return this.data.has(key)
  }
  
  delete(key) {
    this.data.delete(key)
  }
  
  entries() {
    return this.data.entries()
  }
  
  keys() {
    return this.data.keys()
  }
  
  values() {
    return this.data.values()
  }
}