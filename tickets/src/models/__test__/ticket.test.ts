import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
    // Create an instance of a ticket
    const ticket = Ticket.build({
        title: 'Title',
        price: 5,
        userId: '12345'
    });
    
    // Save a ticket to the database
    await ticket.save();

    // Fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // Make 2 separate changes to the tickets we fetchOrder
    firstInstance!.set({ price: 10 });
    secondInstance!.set({ price: 15 });

    // Save the first fetched ticket - expect to succeed
    await firstInstance!.save();

    // Save the seconds fetched ticket - expect to fail due to outdated version number
    // await secondInstance!.save(); // This line fails as expectd
    // expect(async () => await secondInstance!.save()).toThrow(); // this code does not work
    try {
        await secondInstance!.save();
    } catch (err) {
        return;
    }
    throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'Title',
        price: 5,
        userId: '12345'
    });
    
    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);

    await ticket.save();
    expect(ticket.version).toEqual(2);
});