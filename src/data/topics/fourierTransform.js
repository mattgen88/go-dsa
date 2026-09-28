export const fourierTransformTopic = {
  id: 'fourier-transform',
  title: 'Fast Fourier Transform (Cooley-Tukey FFT)',
  category: 'computational',
  difficulty: 'Advanced',
  icon: 'Activity',
  summary: 'Deconstruct complex time-domain signals into pure frequencies and multiply polynomials in O(N log N) using Cooley-Tukey FFT.',
  timeComplexity: {
    'Cooley-Tukey FFT': 'O(N log N)',
    'Naive DFT': 'O(N²)',
    'Inverse FFT (IFFT)': 'O(N log N)',
    'Polynomial Mult': 'O(N log N)',
    'Space': 'O(N)'
  },
  keyPoints: [
    'The Discrete Fourier Transform (DFT) converts a sequence of time-domain signal samples into frequency-domain amplitude and phase components.',
    'Naive DFT requires O(N²) operations because every frequency bin requires a sum over all N time samples.',
    'The Cooley-Tukey FFT achieves O(N log N) by recursively splitting samples into even and odd indexed halves, leveraging the periodic symmetry of complex roots of unity (twiddle factors $W_N^k = e^{-i 2\\pi k / N}$).',
    'Inverse FFT (IFFT): Recovers the original time-domain waveform by conjugating the input, running forward FFT, conjugating again, and dividing by N.',
    'Algorithmic Applications: Audio/speech spectral analysis, image filtering, MRI reconstruction, OFDM in 4G/5G/Wi-Fi, and O(N log N) polynomial multiplication.'
  ],
  goInternals: `// In Go, complex numbers are native built-in types:
// complex128 with standard library "math/cmplx"

import (
    "math"
    "math/cmplx"
)

// Polar construction: cmplx.Rect(r, theta) = r * e^(i * theta)
twiddle := cmplx.Rect(1.0, -2.0 * math.Pi * float64(k) / float64(n))`,
  visualizerType: 'fft',
  codeSamples: {
    core: `package main

import (
	"fmt"
	"math"
	"math/cmplx"
)

// FFT computes the Discrete Fourier Transform using the Cooley-Tukey Radix-2 algorithm.
// Input slice length n must be a power of 2.
// Time Complexity: O(n log n)
func FFT(x []complex128) []complex128 {
	n := len(x)
	if n <= 1 {
		return x
	}

	// 1. Divide: partition into even and odd indexed sub-sequences
	even := make([]complex128, n/2)
	odd := make([]complex128, n/2)
	for i := 0; i < n/2; i++ {
		even[i] = x[2*i]
		odd[i] = x[2*i+1]
	}

	// 2. Conquer: recursively solve FFT on sub-sequences
	evenFFT := FFT(even)
	oddFFT := FFT(odd)

	// 3. Combine: Butterfly operations using complex twiddle factors
	// W_n^k = e^(-2*pi*i*k/n)
	result := make([]complex128, n)
	for k := 0; k < n/2; k++ {
		angle := -2.0 * math.Pi * float64(k) / float64(n)
		twiddle := cmplx.Rect(1.0, angle) * oddFFT[k]

		result[k] = evenFFT[k] + twiddle
		result[k+n/2] = evenFFT[k] - twiddle
	}

	return result
}

func main() {
	// Sample rate: 32 points
	// Compound signal: 3 Hz wave + 7 Hz wave
	const N = 32
	signal := make([]complex128, N)

	fmt.Println("=== 1. Generating Compound Signal: sin(2π·3t) + 0.5·sin(2π·7t) ===")
	for i := 0; i < N; i++ {
		t := float64(i) / float64(N)
		val := math.Sin(2.0*math.Pi*3.0*t) + 0.5*math.Sin(2.0*math.Pi*7.0*t)
		signal[i] = complex(val, 0)
	}

	// Compute Fast Fourier Transform
	freqSpectrum := FFT(signal)

	fmt.Println("\\n=== 2. Frequency Spectrum Analysis (First N/2 Bins) ===")
	fmt.Printf("%-8s | %-12s | %s\\n", "Freq Bin", "Magnitude", "Spectrum Peak")
	fmt.Println("-----------------------------------------------")

	for k := 0; k < N/2; k++ {
		// Magnitude normalized by N/2
		mag := cmplx.Abs(freqSpectrum[k]) / (float64(N) / 2.0)
		peakFlag := ""
		if k == 3 {
			peakFlag = "<--- Primary Peak (3 Hz component!)"
		} else if k == 7 {
			peakFlag = "<--- Secondary Peak (7 Hz component!)"
		}
		fmt.Printf("%-8d | %-12.2f | %s\\n", k, mag, peakFlag)
	}
}`,
    practical: `package main

import (
	"fmt"
	"math"
	"math/cmplx"
)

// Fast Polynomial Multiplication in O(N log N) using FFT
// Multiply P1(x) and P2(x)

func FFT(x []complex128) []complex128 {
	n := len(x)
	if n <= 1 {
		return x
	}
	even := make([]complex128, n/2)
	odd := make([]complex128, n/2)
	for i := 0; i < n/2; i++ {
		even[i] = x[2*i]
		odd[i] = x[2*i+1]
	}
	evenFFT := FFT(even)
	oddFFT := FFT(odd)

	res := make([]complex128, n)
	for k := 0; k < n/2; k++ {
		t := cmplx.Rect(1.0, -2.0*math.Pi*float64(k)/float64(n)) * oddFFT[k]
		res[k] = evenFFT[k] + t
		res[k+n/2] = evenFFT[k] - t
	}
	return res
}

func IFFT(X []complex128) []complex128 {
	n := len(X)
	conj := make([]complex128, n)
	for i := range X {
		conj[i] = cmplx.Conj(X[i])
	}
	fftRes := FFT(conj)
	res := make([]complex128, n)
	for i := range fftRes {
		res[i] = cmplx.Conj(fftRes[i]) / complex(float64(n), 0)
	}
	return res
}

// MultiplyPolynomials multiplies coefficients of A and B in O(N log N)
func MultiplyPolynomials(a, b []float64) []int {
	// Pad to next power of 2 >= len(a) + len(b) - 1
	n := 1
	for n < len(a)+len(b) {
		n <<= 1
	}

	ca := make([]complex128, n)
	cb := make([]complex128, n)
	for i, v := range a {
		ca[i] = complex(v, 0)
	}
	for i, v := range b {
		cb[i] = complex(v, 0)
	}

	// 1. Evaluate: Convert coefficient form -> point-value form
	fa := FFT(ca)
	fb := FFT(cb)

	// 2. Pointwise multiplication in O(N)
	fc := make([]complex128, n)
	for i := 0; i < n; i++ {
		fc[i] = fa[i] * fb[i]
	}

	// 3. Interpolate: Convert point-value form back -> coefficients via IFFT
	c := IFFT(fc)

	resLen := len(a) + len(b) - 1
	result := make([]int, resLen)
	for i := 0; i < resLen; i++ {
		result[i] = int(math.Round(real(c[i])))
	}
	return result
}

func main() {
	// Multiply: (1 + 2x) * (3 + 4x)
	// Expected: 3 + 10x + 8x^2 -> [3, 10, 8]
	polyA := []float64{1, 2}
	polyB := []float64{3, 4}

	product := MultiplyPolynomials(polyA, polyB)
	fmt.Println("Polynomial A: 1 + 2x")
	fmt.Println("Polynomial B: 3 + 4x")
	fmt.Printf("A * B via FFT: %v (Coefficients for 1, x, x^2)\\n", product)

	// Large polynomial product: (2 + 3x + x^2) * (1 + 5x)
	// = 2 + 10x + 3x + 15x^2 + x^2 + 5x^3 = 2 + 13x + 16x^2 + 5x^3
	pA := []float64{2, 3, 1}
	pB := []float64{1, 5}
	fmt.Printf("(2 + 3x + x^2) * (1 + 5x) = %v\\n", MultiplyPolynomials(pA, pB))
}`,
    exercise: `package main

import (
	"fmt"
	"math"
	"math/cmplx"
)

func FFT(x []complex128) []complex128 {
	n := len(x)
	if n <= 1 {
		return x
	}
	even := make([]complex128, n/2)
	odd := make([]complex128, n/2)
	for i := 0; i < n/2; i++ {
		even[i] = x[2*i]
		odd[i] = x[2*i+1]
	}
	evenFFT := FFT(even)
	oddFFT := FFT(odd)

	res := make([]complex128, n)
	for k := 0; k < n/2; k++ {
		t := cmplx.Rect(1.0, -2.0*math.Pi*float64(k)/float64(n)) * oddFFT[k]
		res[k] = evenFFT[k] + t
		res[k+n/2] = evenFFT[k] - t
	}
	return res
}

// TASK: Implement IFFT (Inverse Fast Fourier Transform).
// Mathematically: IFFT(X) = (1/N) * Conj(FFT(Conj(X)))
func IFFT(X []complex128) []complex128 {
	n := len(X)
	conj := make([]complex128, n)
	for i := range X {
		conj[i] = cmplx.Conj(X[i])
	}
	fftRes := FFT(conj)
	res := make([]complex128, n)
	for i := range fftRes {
		res[i] = cmplx.Conj(fftRes[i]) / complex(float64(n), 0)
	}
	return res
}

func main() {
	// Original test signal
	original := []complex128{complex(1, 0), complex(4, 0), complex(3, 0), complex(2, 0)}
	fmt.Printf("Original time-domain signal: %v\\n", original)

	// Step 1: Forward FFT to frequency domain
	spectrum := FFT(original)
	fmt.Printf("Frequency spectrum:          %v\\n", spectrum)

	// Step 2: Inverse FFT back to time domain
	reconstructed := IFFT(spectrum)
	fmt.Printf("Reconstructed via IFFT:      %v\\n", reconstructed)

	// Verify exact match
	match := true
	for i := range original {
		if math.Abs(real(original[i])-real(reconstructed[i])) > 1e-9 {
			match = false
		}
	}

	if match {
		fmt.Println("\\nSUCCESS: Perfect signal reconstruction! IFFT(FFT(x)) == x")
	} else {
		fmt.Println("\\nFAILURE: Signal reconstruction mismatch.")
	}
}`
  }
}
