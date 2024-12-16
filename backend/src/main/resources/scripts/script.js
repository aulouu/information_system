import http from 'k6/http';
import {check, fail, group, sleep} from 'k6';
import {SharedArray} from 'k6/data';
import exec from 'k6/execution';

export const options = {
    scenarios: {
        concurrent_users: {
            executor: 'ramping-vus',
            startVUs: 4,
            stages: [
                {duration: '10s', target: 10},
                {duration: '20s', target: 10},
                {duration: '1s', target: 0},
            ],
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<2000'],
    },
};
const BASE_URL = 'http://localhost:24680';
const importFileContent = open('./persons.yaml', 'b');
const SHARED_PERSON_NAME = 'SharedPerson';
const testUsers = new SharedArray('users', function () {
    return [
        {username: 'userTest1', password: 'UserTest1'},
        {username: 'userTest2', password: 'UserTest2'},
    ];
});

function importPersons(token, fileContent) {
    const payload = {
        file: http.file(fileContent, "persons.yaml"),
    };
    return http.post(`${BASE_URL}/import`, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        timeout: "60s",
    });
}

function login(username, password) {
    const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
        username: username,
        password: password,
    }), {
        headers: {'Content-Type': 'application/json'},
        timeout: '10s',
    });
    if (!check(loginRes, {
        'login successful': (r) => r.status === 200,
    })) {
        fail(`Login failed for user ${username}`);
    }
    return loginRes.json('token');
}

export function setup() {
    const tokenUser1 = login(testUsers[0].username, testUsers[0].password);
    const tokenUser2 = login(testUsers[1].username, testUsers[1].password);

    const coordinates = createCoordinates(tokenUser1);
    const location = createLocation(tokenUser1);
    const response = createPerson(tokenUser1, SHARED_PERSON_NAME, coordinates.json('id'), location.json('id'));
    if (response.status !== 200) {
        fail('Failed to create the shared person for testing.');
    }

    return {
        sharedPersonId: response.json('id'),
        coordinatesId: coordinates.json('id'),
        locationId: location.json('id'),
        sharedRouteTokens: [tokenUser1, tokenUser2],
    };
}

function createCoordinates(token) {
    const coordinates = {
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
        adminCanModify: true
    };
    return http.post(`${BASE_URL}/coordinates`, JSON.stringify(coordinates), {
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        timeout: '10s',
    });
}

function createLocation(token) {
    const location = {
        name: 'Location ' + Math.floor(Math.random() * 100),
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
        z: Math.floor(Math.random() * 100),
        adminCanModify: true
    };
    return http.post(`${BASE_URL}/location`, JSON.stringify(location), {
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        timeout: '10s',
    });
}

function generateRandomBirthday() {
    const start = new Date(1900, 0, 1); // Начальная дата
    const end = new Date(); // Текущая дата
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
    const day = (date.getDate() < 10 ? '0' : '') + date.getDate();
    const month = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1);
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function createPerson(token, personName, coordinatesId, locationId) {
    const date = generateRandomBirthday();
    // const coordinatesId = createCoordinates(token).json('id');
    // const locationId = createLocation(token).json('id');
    const person = {
        name: personName,
        coordinatesId: coordinatesId,
        eyeColor: "GREEN",
        hairColor: "RED",
        locationId: locationId,
        height: Math.floor(Math.random() * 200) + 1,
        birthday: formatDate(date),
        nationality: "RUSSIA",
        adminCanModify: true,
    };
    return http.post(`${BASE_URL}/person`, JSON.stringify(person), {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        timeout: '10s',
    });
    // console.log(`Creating person with data: ${JSON.stringify(person)}`);
    // const res = http.post(`${BASE_URL}/person`, JSON.stringify(person), {
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${token}`
    //     },
    //     timeout: '10s',
    // });
    // if (res.status !== 200) {
    //     console.log(`Create person response: ${res.status} - ${res.body}`);
    //     fail(`Failed to create person: ${res.status} - ${res.body}`);
    // }
    // return res;
}

export default function (data) {
    let personId = data.sharedPersonId;
    let coordinatesId = data.coordinatesId;
    let locationId = data.locationId;
    const date = generateRandomBirthday();
    const userCreds = testUsers[exec.vu.iterationInScenario % testUsers.length];
    const token = login(userCreds.username, userCreds.password);
    group('Update Shared Person', () => {
        const updatedName = `UpdatedPerson_${Math.random().toString(36).substring(7)}`;
        const response = http.patch(`${BASE_URL}/person/${personId}`, JSON.stringify({
            id: personId,
            name: updatedName,
            coordinatesId: coordinatesId,
            eyeColor: "ORANGE",
            hairColor: "GREEN",
            locationId: locationId,
            height: Math.floor(Math.random() * 200) + 1,
            birthday: formatDate(date),
            nationality: "CHINA",
            adminCanModify: true
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            timeout: '10s',
        });

        check(response, {
            'shared person update handled correctly': (r) =>
                r.status === 200 || r.status === 400,
        });
        if (response.status !== 200 && response.status !== 400) {
            console.log(response.status + "Update Shared Person");
            console.log(response.json());
        }
        else{
            personId = response.json('id');
        }
    });
    group('Delete Shared Person', () => {
        const response = http.del(`${BASE_URL}/person/${personId}`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            timeout: '10s',
        });
        check(response, {
            'shared person deletion handled correctly': (r) =>
                [400, 200].includes(r.status),
        });
        if (response.status !== 200 && response.status !== 400) {
            console.log(response.status + "Delete Shared Person");
            console.log(response.json());
        }
    });
    group('Import Person Concurrently', () => {
        const response = importPersons(token, importFileContent);
        check(response, {
            'import persons handled correctly': (r) =>
                r.status === 200 || r.status === 400,
        });
        if (response.status !== 200 && response.status !== 400) {
            console.log(response.status + "Import Person Concurrently");
            console.log(response.json());
        }
    });
    sleep(0.5);
}
