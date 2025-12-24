import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoItem } from './TodoItem';
import type { Todo } from '../../types/todo';

describe('TodoItem', () => {
  it('renders todo title correctly', () => {
    const todo: Todo = {
      id: 1,
      userId: 1,
      title: 'Test todo item',
      completed: false,
    };

    render(<TodoItem todo={todo} />);

    expect(screen.getByText('Test todo item')).toBeInTheDocument();
  });

  it('shows checkbox as unchecked when todo is not completed', () => {
    const todo: Todo = {
      id: 1,
      userId: 1,
      title: 'Incomplete todo',
      completed: false,
    };

    render(<TodoItem todo={todo} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('shows checkbox as checked when todo is completed', () => {
    const todo: Todo = {
      id: 2,
      userId: 1,
      title: 'Completed todo',
      completed: true,
    };

    render(<TodoItem todo={todo} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('applies completed styling when todo is completed', () => {
    const todo: Todo = {
      id: 3,
      userId: 1,
      title: 'Done task',
      completed: true,
    };

    const { container } = render(<TodoItem todo={todo} />);

    // Check for completed class in the className string
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv.className).toContain('completed');
  });

  it('does not apply completed styling when todo is not completed', () => {
    const todo: Todo = {
      id: 4,
      userId: 1,
      title: 'Pending task',
      completed: false,
    };

    const { container } = render(<TodoItem todo={todo} />);

    // Check that completed class is not in the className string
    const itemDiv = container.firstChild as HTMLElement;
    expect(itemDiv.className).not.toContain('completed');
  });

  it('has proper accessibility label', () => {
    const todo: Todo = {
      id: 5,
      userId: 1,
      title: 'Accessible todo',
      completed: false,
    };

    render(<TodoItem todo={todo} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute(
      'aria-label',
      'Accessible todo - not completed'
    );
  });

  it('has proper accessibility label for completed todo', () => {
    const todo: Todo = {
      id: 6,
      userId: 1,
      title: 'Accessible completed todo',
      completed: true,
    };

    render(<TodoItem todo={todo} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute(
      'aria-label',
      'Accessible completed todo - completed'
    );
  });
});
