import Button from '@mui/material/Button';

interface StyleButtonProps {
    type?: "button" | "submit" | "reset";
    fullWidth?: boolean;
    variant?: "text" | "outlined" | "contained";
    mt?: number;
    mb?: number;
    fontFamily?: string;
    backgroundColor?: string;
    color?: string;
    disabled?: boolean;
    text: string;
    onclick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
export default function StyleButton(props: StyleButtonProps) {
   return (
      <Button
         type={props.type}
         fullWidth={props.fullWidth}
         variant={props.variant || "contained"}
         sx={{
            mt: props.mt || 3,
            mb: props.mb || 2,
            fontFamily: props.fontFamily || "Undertale",
            backgroundColor: props.backgroundColor || '#332127',
            color: props.color || 'white',
            ":hover": {
               backgroundColor: '#22161a',
               color: '#dccad0'
            },
            ":active": {
               backgroundColor: '#22161a',
               color: '#dccad0'
            },
            ":active:after": {
               backgroundColor: '#22161a',
               color: '#dccad0'
            }
         }}
         onClick={props.onclick}
         disabled={props.disabled}
      >
         {props.text}
      </Button>
   );
}
