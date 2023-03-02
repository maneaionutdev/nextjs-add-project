import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddProject from '../components/AddProject';
import { AddProjectProps } from '@/types';

const onSubmitMock = jest.fn();
const cancelEditMock = jest.fn();

const props: AddProjectProps = {
  onSubmit: onSubmitMock,
  cancelEdit: cancelEditMock,
};

describe('AddProject component', () => {
  it('renders the form with the correct inputs', () => {
    render(<AddProject {...props} />);

    expect(screen.getByTestId('title-input')).toBeInTheDocument();
    expect(screen.getByTestId('link-input')).toBeInTheDocument();
    expect(screen.getByTestId('description-input')).toBeInTheDocument();
  });

  it('submits the form with the correct data', () => {
    const onSubmitMock = jest.fn();
    const { getByTestId } = render(<AddProject onSubmit={onSubmitMock} />);
    const titleInput = getByTestId('title-input') as HTMLInputElement;
    const descriptionInput = getByTestId('description-input') as HTMLInputElement;
    const linkInput = getByTestId('link-input') as HTMLInputElement;
    const submitButton = getByTestId('submit-btn');

    const title = 'Test Portfolio';
    const description = 'This is a test portfolio.';
    const link = 'https://www.example.com';

    fireEvent.change(titleInput, { target: { value: title } });
    fireEvent.change(descriptionInput, { target: { value: description } });
    fireEvent.change(linkInput, { target: { value: link } });
    fireEvent.click(submitButton);

    expect(onSubmitMock).toHaveBeenCalledTimes(1);
    expect(onSubmitMock).toHaveBeenCalledWith(
      {
        title,
        description,
        link,
        files: [],
      },
      false,
    );
  });

  it('wont call if title is empty', () => {
    const onSubmitMock = jest.fn();
    const { getByTestId } = render(<AddProject onSubmit={onSubmitMock} />);

    const linkInput = getByTestId('link-input') as HTMLInputElement;
    const submitButton = getByTestId('submit-btn');
    const invalidLink = 'invalid link';

    fireEvent.change(linkInput, { target: { value: invalidLink } });
    fireEvent.click(submitButton);

    expect(onSubmitMock).not.toHaveBeenCalled();
  });
});
