import {useSelector} from 'react-redux';
import {appSelector} from "../../../storage/Slices/AppSlice";
import Graph from './Graph';
import {Box} from '@mui/material';

function MapPage() {
    const {personsAll} = useSelector(appSelector);

    return (
        <>
            <Box sx={{
                mt: 1,
                background: 'white', padding: '20px', borderColor: 'white',
                borderWidth: '6px', textAlign: 'center', borderStyle: 'solid',
                marginTop: '30px', marginBottom: '30px'
            }}>
                <Graph points={personsAll.map(person => [person.coordinates.x, person.coordinates.y, person.userId])}
                       persons={personsAll}/>
            </Box>
        </>
    );
}

export default MapPage