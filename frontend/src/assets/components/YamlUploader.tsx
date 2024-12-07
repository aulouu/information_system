import React, {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import axios from 'axios';
import {AppDispatch} from '../../storage/store';
import {useDispatch} from 'react-redux';
import {setError, setErrorMessage, setSuccess} from '../../storage/Slices/AppSlice';

const YamlUploader = () => {
    const dispatch = useDispatch<AppDispatch>();
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append('file', file);
        axios.post(`http://localhost:24680/import`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                "Authorization": 'Bearer ' + String(localStorage.getItem('token'))
            }
        })
            .then(response => {
                dispatch(setSuccess(true));
                dispatch(setErrorMessage("File uploaded successfully"));
            })
            .catch(error => {
                dispatch(setError(true));
                console.log(error.response.data);
                dispatch(setErrorMessage(error.response.data));
            });
    }, []);
    const {getRootProps, getInputProps} = useDropzone({
        onDrop,
        accept: {
            'text/yaml': ['.yaml', '.yml']
        }
    });
    return (
        <div {...getRootProps()} style={{
            border: '2px dashed #cccccc',
            padding: '20px',
            textAlign: 'center',
            color: 'white',
            fontFamily: 'Undertale'
        }}>
            <input {...getInputProps()} />
            <p>Drag YAML file here or click to select file</p>
        </div>
    );
};

export default YamlUploader;
