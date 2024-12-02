import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { appSelector, IPerson, setUpdatedPerson } from "../../../storage/Slices/AppSlice";
import { AppDispatch } from '../../../storage/store';
import { PersonArray } from '../Person/PersonTable';
import PersonInfo from './PersonInfo.tsx';



export default function Graph({ points, persons }: { points: number[][], persons: PersonArray }) {
    const dispatch = useDispatch<AppDispatch>();
    const [open, setOpen] = useState(false);

    const handleOpen = (person: IPerson) => {
        dispatch(setUpdatedPerson(person));
        const timer = setTimeout(() => {
            setOpen(true);
        }, 50);
    };

    const handleClose = () => setOpen(false);


    const handleGraphClick = () => {
        const x = Number(cursorPosition.x.toFixed(2));
        const y = Number(cursorPosition.y.toFixed(2));

        if (points && points.length) {
            points.forEach((point, index) => {
                if (point[0] <= x + (2 * point[2]) && point[0] >= x - (2 * point[2])
                    && point[1] <= y + (2 * point[2]) && point[1] >= y - (2 * point[2])) {
                    handleOpen(persons[index]);
                }
            });
        }
    }

    const width = 800, height = 800

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    function calculateInitialBounds(points: number[][]) {
        if (points && points.length > 0) {
            const xValues = points.map(point => point[0]);
            const yValues = points.map(point => point[1]);

            return {
                xmin: -(Math.max(Math.abs(Math.min(...xValues)), Math.max(...xValues)) + 6),
                xmax: (Math.max(Math.abs(Math.min(...xValues)), Math.max(...xValues)) + 6),
                ymin: -(Math.max(Math.abs(Math.min(...yValues)), Math.max(...yValues)) + 6),
                ymax: (Math.max(Math.abs(Math.min(...yValues)), Math.max(...yValues)) + 6),
            };
        }
        // Возвращаем значения по умолчанию, если нет точек
        return { xmin: -100, xmax: 100, ymin: -100, ymax: 100 };
    }

    // Используем функцию для инициализации состояния bounds
    const [bounds, setBounds] = useState(() => calculateInitialBounds(points));


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const handleMouseMove = (event: { clientX: number; clientY: number; }) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = width / (bounds.xmax - bounds.xmin);
            const scaleY = height / (bounds.ymax - bounds.ymin);
            const canvasX = event.clientX - rect.left;
            const canvasY = event.clientY - rect.top;
            const graphX = (canvasX / scaleX) + bounds.xmin;
            const graphY = bounds.ymax - (canvasY / scaleY);
            setCursorPosition({ x: graphX, y: graphY });
        };

        const boundsAreValid = Math.abs(bounds.xmin) === Math.abs(bounds.xmax) && Math.abs(bounds.ymin) === Math.abs(bounds.ymax);

        if (boundsAreValid) {
            canvas.addEventListener('mousemove', handleMouseMove);
        } else {
            setCursorPosition({ x: 0, y: 0 });
        }

        return () => {
            if (boundsAreValid) {
                canvas.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, [bounds]);

    useEffect(() => {
        setBounds(calculateInitialBounds(points));
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        drawGraph(context, bounds);
    }, [points]);

    const drawGraph = (ctx: CanvasRenderingContext2D | null, bounds: { xmin: any; xmax: any; ymin: any; ymax: any; }) => {
        if (!ctx) return;
        const scaleX = width / (bounds.xmax - bounds.xmin);
        const scaleY = height / (bounds.ymax - bounds.ymin);

        const offsetX = width / 2;
        const offsetY = height / 2;
        ctx.clearRect(0, 0, width, height); // Очищаем canvas

        // Рисуем оси
        ctx.beginPath();
        ctx.moveTo(0, offsetY);
        ctx.lineTo(width, offsetY);
        ctx.moveTo(offsetX, 0);
        ctx.lineTo(offsetX, height);
        ctx.strokeStyle = 'black';
        ctx.stroke();

        // Функция для добавления делений и значений на оси
        const drawAxisLabels = () => {
            const tickSize = 5;
            let stepX, stepY;

            // Определяем шаг на основе диапазона значений
            if (bounds.xmin > -6 && bounds.xmax < 6) {
                stepX = 0.2;
                stepY = 0.2; // Пример, можно настроить отдельно для оси Y
            } else {
                stepX = (bounds.xmax - bounds.xmin) / 20; // Более крупный шаг для больших диапазонов
                stepY = (bounds.ymax - bounds.ymin) / 20; // Аналогично для оси Y
            }

            ctx.font = '10px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';

            // Деления и значения по оси X
            for (let xValue = -1000; xValue <= 1000; xValue += stepX) {
                const x = offsetX + (xValue * scaleX);
                ctx.moveTo(x, offsetY - tickSize);
                ctx.lineTo(x, offsetY + tickSize);
                ctx.fillText(xValue.toFixed(1), x, offsetY + tickSize + 10);
            }

            // Деления и значения по оси Y
            for (let yValue = -1000; yValue <= 1000; yValue += stepY) {
                if (Math.abs(yValue) >= 0.1) { // Подписываем только целые числа
                    const y = offsetY - (yValue * scaleY);
                    ctx.moveTo(offsetX - tickSize, y);
                    ctx.lineTo(offsetX + tickSize, y);
                    ctx.fillText(yValue.toFixed(1), offsetX - tickSize - 10, y + 3);
                }
            }

            ctx.stroke();
        };

        drawAxisLabels();

        // Рисуем график
        if (points && points.length) {

            const colorMap: { [key: number]: string } = {};
            points.forEach(point => {
                if (!colorMap[point[3]]) {
                    colorMap[point[3]] = `hsl(${point[3] * 20}, 100%, 50%)`;
                }

                ctx.fillStyle = colorMap[point[3]];
                const x = offsetX + (point[0] * scaleX);
                const y = offsetY - (point[1] * scaleY);
                ctx.beginPath(); // Начинаем новый путь для каждой точки
                ctx.arc(x, y, 2 * point[2], 0, 2 * Math.PI); // Рисуем круг



                ctx.fill();
            });
        }
    };


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        drawGraph(context, bounds);
    }, [bounds]);

    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

    return (
        <div className="graph" >
            <div className="center-container">
                <canvas ref={canvasRef} width={width} height={height} onClick={handleGraphClick} />
            </div>
            <p>X: {cursorPosition.x.toFixed(2)}, Y: {cursorPosition.y.toFixed(2)}</p>
            <div><PersonInfo open={open} onClose={handleClose} /></div>

        </div>
    );
};