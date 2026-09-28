export const slidingWindowNetworkTopic = {
  id: 'sliding-window-protocol',
  title: 'TCP Sliding Window Flow Control',
  category: 'networking',
  difficulty: 'Intermediate',
  icon: 'Wifi',
  summary: 'Reliable byte-stream transmission, sequence numbers, cumulative ACKs, and receiver buffer flow control.',
  timeComplexity: {
    'Transmission': 'O(window_size) packets inflight',
    'ACK Processing': 'O(1)',
    'Throughput': 'Bandwidth * Round-Trip-Time (BDP)'
  },
  keyPoints: [
    'The TCP Sliding Window allows the sender to transmit multiple packets before waiting for an acknowledgment (ACK), preventing stop-and-wait channel under-utilization.',
    'Receiver Advertised Window (`rwnd`): The receiver reports its available receive buffer size in every ACK header, preventing buffer overflow.',
    'Cumulative ACKs: ACK $N$ acknowledges that all bytes up to $N-1$ have been received successfully.',
    'Bandwidth-Delay Product (BDP): Maximum data in transit is limited by $\\text{Window} = \\text{Bandwidth} \\times \\text{RTT}$.'
  ],
  goInternals: `// In Go net/http & net.TCPConn, sliding window and buffering
// are handled by the OS kernel TCP stack, configured via:
// conn.SetReadBuffer(bytes)
// conn.SetWriteBuffer(bytes)`,
  visualizerType: 'array',
  codeSamples: {
    core: `package main

import "fmt"

type Packet struct {
	SeqNum int
	Data   string
}

// TCPSender simulates a sliding window sender
type TCPSender struct {
	windowSize  int
	baseSeq     int // oldest unacknowledged byte/packet
	nextSeq     int // next packet to send
	totalPackets int
}

func NewSender(winSize, total int) *TCPSender {
	return &TCPSender{
		windowSize:   winSize,
		baseSeq:      0,
		nextSeq:      0,
		totalPackets: total,
	}
}

// CanSend returns true if window has free transmission slots
func (s *TCPSender) CanSend() bool {
	return s.nextSeq < s.baseSeq+s.windowSize && s.nextSeq < s.totalPackets
}

// SendPacket dispatches next packet inside window
func (s *TCPSender) SendPacket() (Packet, bool) {
	if !s.CanSend() {
		return Packet{}, false
	}
	pkt := Packet{SeqNum: s.nextSeq, Data: fmt.Sprintf("Payload-%d", s.nextSeq)}
	s.nextSeq++
	return pkt, true
}

// ReceiveACK slides the window base forward upon cumulative ACK
func (s *TCPSender) ReceiveACK(ackSeq int) {
	if ackSeq >= s.baseSeq {
		fmt.Printf(" [ACK %d received] Sliding window base: %d -> %d\\n",
			ackSeq, s.baseSeq, ackSeq+1)
		s.baseSeq = ackSeq + 1
	}
}

func main() {
	// Window size 3 packets, 6 packets total
	sender := NewSender(3, 6)

	fmt.Println("=== 1. Fill Initial Sender Window (Size: 3) ===")
	for sender.CanSend() {
		pkt, _ := sender.SendPacket()
		fmt.Printf("Sent packet SeqNum: %d (In-flight: [%d..%d])\\n",
			pkt.SeqNum, sender.baseSeq, sender.nextSeq-1)
	}

	fmt.Printf("Can send more? %t (Window full!)\\n\\n", sender.CanSend())

	fmt.Println("=== 2. Receive ACKs and Slide Window Forward ===")
	sender.ReceiveACK(0) // ACK packet 0
	if sender.CanSend() {
		pkt, _ := sender.SendPacket()
		fmt.Printf("Sent new packet SeqNum: %d after window slid!\\n", pkt.SeqNum)
	}

	sender.ReceiveACK(1) // ACK packet 1
	if sender.CanSend() {
		pkt, _ := sender.SendPacket()
		fmt.Printf("Sent new packet SeqNum: %d after window slid!\\n", pkt.SeqNum)
	}
}`,
    practical: `package main

import "fmt"

// CalculateBDP computes Bandwidth-Delay Product (ideal window size)
func CalculateBDP(bandwidthMbps float64, rttMs float64) float64 {
	// Bits = Mbps * 1e6 * (RTT_seconds)
	bits := (bandwidthMbps * 1e6) * (rttMs / 1000.0)
	bytes := bits / 8.0
	return bytes
}

func main() {
	// 100 Mbps fiber link with 50 ms latency
	bw := 100.0 // Mbps
	rtt := 50.0 // ms

	bdpBytes := CalculateBDP(bw, rtt)
	fmt.Printf("Bandwidth: %.0f Mbps, RTT: %.0f ms\\n", bw, rtt)
	fmt.Printf("Optimal TCP Window Size: %.0f Bytes (~%.1f KB)\\n", 
		bdpBytes, bdpBytes/1024.0)
}`,
    exercise: `package main

import "fmt"

// TASK: Check if sequence number falls within current receiver window
func IsWithinWindow(seq, windowBase, windowSize int) bool {
	return seq >= windowBase && seq < windowBase+windowSize
}

func main() {
	base := 10
	size := 5 // Window accepts [10, 11, 12, 13, 14]

	fmt.Printf("Seq 12 in [10..14]: %t (Expected: true)\\n", IsWithinWindow(12, base, size))
	fmt.Printf("Seq 9  in [10..14]: %t (Expected: false)\\n", IsWithinWindow(9, base, size))
	fmt.Printf("Seq 15 in [10..14]: %t (Expected: false)\\n", IsWithinWindow(15, base, size))
}`
  }
}
