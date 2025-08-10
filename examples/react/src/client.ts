import { hc } from 'hono/client'
import { treaty } from '@elysiajs/eden';

import { type RemotePetsStore as ElysiaRemotePetsStore, type LocalPetsStore as ElysiaLocalPetsStore } from '@yag-openapi/client/elysia';
import { type RemotePetsStore as HonoRemotePetsStore, type LocalPetsStore as HonoLocalPetsStore } from '@yag-openapi/client/hono';

export const elysia = {
    local: treaty<ElysiaLocalPetsStore>('https://petstore.swagger.io/v2'),
    remote: treaty<ElysiaRemotePetsStore>('https://petstore.swagger.io/v2'),
};

export const hono = {
    local: hc<HonoLocalPetsStore>('https://petstore.swagger.io/v2'),
    remote: hc<HonoRemotePetsStore>('https://petstore.swagger.io/v2'),
};

const config = {
    petId: 2,
}

async function testHono() {
    const response = await hono.local.pet[':petId'].$get({ param: { petId: config.petId } });
    const pet = await response.json();
    console.log('Hono Pet:', pet);
}

async function testElysia() {
    const { data: pet } = await elysia.local.pet({ petId: config.petId }).get();
    console.log('Elysia Pet:', pet);
}

Promise.all([testHono(), testElysia()]).then(() => {
    console.log('Tests completed successfully');
}).catch(console.error);