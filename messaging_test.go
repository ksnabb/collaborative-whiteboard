package main

import (
	"testing"
)

func TestMessaging(t *testing.T) {

	// create three channels
	ch1 := make(chan []byte, 2)
	ch2 := make(chan []byte, 2)
	ch3 := make(chan []byte, 2)

	// subscribe all to one and a pair separatelly
	Subscribe(ch1, "123")
	Subscribe(ch2, "123")
	Subscribe(ch3, "123")
	Subscribe(ch1, "12")
	Subscribe(ch2, "12")

	Send([]byte("hello group"), "123")

	// channel one, two and three should receive this message
	m, ok := <-ch1
	if !ok || string(m) != "hello group" {
		t.Fail()
	}
	m, ok = <-ch2
	if !ok || string(m) != "hello group" {
		t.Fail()
	}
	m, ok = <-ch3
	if !ok || string(m) != "hello group" {
		t.Fail()
	}

	// send message to 12
	Send([]byte("hello 12"), "12")
	ch3 <- []byte("no 12")

	// channel one, two should receive this message
	m, ok = <-ch1
	if !ok || string(m) != "hello 12" {
		t.Fail()
	}
	m, ok = <-ch2
	if !ok || string(m) != "hello 12" {
		t.Fail()
	}
	m, ok = <-ch3
	if !ok || string(m) != "no 12" {
		t.Fail()
	}
}

func BenchmarkMessaging(b *testing.B) {

	// create client channel
	cc := make(chan []byte)

	// drain the channel
	go func() {
		for {
			<-cc
		}
	}()

	// subscribe channel to a group
	Subscribe(cc, "bench group")

	// send message to group
	Send([]byte("hello group"), "bench group")

}
