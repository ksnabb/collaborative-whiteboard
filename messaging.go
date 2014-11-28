package main

// group represents a group of listeners
type group struct {
	send        chan []byte            // send message to group by sending the []byte message to this channel
	subscribe   chan chan<- []byte     // send channel to this channel to unsubscribe
	unsubscribe chan chan<- []byte     // send channel to this channel to subscribe
	listeners   map[chan<- []byte]bool // map of listeners where the key is the channel
}

// create a map of groups, each group has a unique name (string)
var groups = make(map[string]*group)

// this is the main application that is running for each group
// created.
func (g *group) run() {
	for {
		select {
		case c := <-g.subscribe:
			g.listeners[c] = true
		case c := <-g.unsubscribe:
			delete(g.listeners, c)
		case m := <-g.send:
			for listener := range g.listeners {
				listener <- m
			}
		}
	}
}

// get the group with the given name
func getGroup(groupName string) *group {
	if _, ok := groups[groupName]; !ok { // if group does not exist create one
		groups[groupName] = &group{
			send:        make(chan []byte),
			subscribe:   make(chan chan<- []byte),
			unsubscribe: make(chan chan<- []byte),
			listeners:   make(map[chan<- []byte]bool),
		}
		go groups[groupName].run()
	}
	return groups[groupName]
}

// Subscribe the given channel to group
func Subscribe(channel chan []byte, groupName string) {
	g := getGroup(groupName)
	g.subscribe <- channel
}

// Unsubscribe from a channel
func Unsubscribe(channel chan []byte, groupName string) {
	g := getGroup(groupName)
	g.unsubscribe <- channel
}

// Send message to group
func Send(message []byte, groupName string) {
	g := getGroup(groupName)
	g.send <- message
}
