import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, forgotPasswordSchema } from '../../helpers/schema';
import { loginUser, forgotPassword } from '@/apis';
import { message, Modal } from 'antd';
import { login } from '../../redux/slices/authSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ThemedButton from '@/components/ThemedButton';
import { Eye, EyeClosed, Key } from 'lucide-react';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      const res = await loginUser(values);
      dispatch(login(res.data.data));
      message.success('Logged in');
      navigate('/dashboard');
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = () => {
    setVisible((prev) => !prev);
  };

  // Forgot Password Form
  const ForgotPasswordForm = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (values) => {
      try {
        setLoading(true);
        await forgotPassword(values);
        message.success('Password reset email sent successfully');
        setForgotPasswordVisible(false);
      } catch (err) {
        message.error(err.response?.data?.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label htmlFor="forgot-email" className="theme-text text-xl font-semibold">
            Email
          </label>
          <input
            type="email"
            id="forgot-email"
            {...register('email')}
            className="w-full border-2 theme-border rounded-md py-1 px-2 focus:outline-none mt-1"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}
        </div>
        <ThemedButton
          type="submit"
          text="Send Reset Link"
          className="p-2 font-semibold text-xl"
          loading={loading}
        />
      </form>
    );
  };

  return (
    <div className="w-screen h-screen flex">
      <div className="w-1/2 flex-content-center">
        <img src="/logo.png" alt="Kaacib Logo" className="w-32 h-32" />
      </div>
      <div className="w-1/2 h-full flex-content-left">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="h-full flex-content-center flex-col gap-4"
        >
          <div className="w-full flex flex-col gap-2">
            <label htmlFor="email" className="theme-text text-xl font-semibold">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className="w-full border-2 theme-border rounded-md py-1 px-2 focus:outline-none"
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="theme-text text-xl font-semibold"
            >
              Password
            </label>
            <div className="flex-content-center w-full border-2 theme-border rounded-md py-1 px-2 ">
              <input
                type={visible ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                className="focus:outline-none"
                {...register('password')}
              />
              {visible ? (
                <Eye
                  onClick={toggleVisibility}
                  className="theme-text cursor-pointer"
                />
              ) : (
                <EyeClosed
                  onClick={toggleVisibility}
                  className="theme-text cursor-pointer"
                />
              )}
            </div>
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>
          <ThemedButton
            type="submit"
            text="Login"
            className="p-2 font-semibold text-xl"
            loading={loading}
          />
          <button
            type="button"
            onClick={() => setForgotPasswordVisible(true)}
            className="text-sm theme-text hover:underline mt-2"
          >
            Forgot Password?
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        title="Forgot Password"
        open={forgotPasswordVisible}
        onCancel={() => setForgotPasswordVisible(false)}
        footer={null}
      >
        <ForgotPasswordForm />
      </Modal>
    </div>
  );
};

export default Login;
